import { xReadGroup, xAck, CONSUMER_GROUP, type WebsiteStatusEvent } from "redis-stream/client";
import { prismaClient } from "db";
import OpenAI from "openai";

const AI_ANALYZER_WORKER_ID = "ai-analyzer-1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY environment variable is required");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

interface EnhancedWebsiteStatusEvent {
    websiteId: string;
    status: 'UP' | 'DOWN';
    responseTime: number;
    checkedAt: string;
    httpStatusCode?: number;
    errorType?: string;
    errorMessage?: string;
    responseHeaders?: Record<string, string>;
    dnsResolutionTime?: number;
    sslInfo?: {
        valid: boolean;
        expiryDate?: string;
        issuer?: string;
    };
}

interface AIAnalysisResult {
    failureType: string;
    severity: string;
    summary: string;
    recommendations: string;
    confidence: number;
}

async function analyzeFailure(
    websiteData: EnhancedWebsiteStatusEvent,
    websiteUrl: string,
    websiteName: string,
    recentHistory: any[]
): Promise<AIAnalysisResult> {
    
    const prompt = `
You are an expert website monitoring AI analyzing a website failure. Based on the following data, provide a detailed analysis:

**Website Information:**
- Name: ${websiteName}
- URL: ${websiteUrl}
- Current Status: ${websiteData.status}

**Failure Details:**
- HTTP Status Code: ${websiteData.httpStatusCode || 'N/A'}
- Error Type: ${websiteData.errorType || 'N/A'}
- Error Message: ${websiteData.errorMessage || 'N/A'}
- Response Time: ${websiteData.responseTime}ms
- DNS Resolution Time: ${websiteData.dnsResolutionTime || 'N/A'}ms
- SSL Valid: ${websiteData.sslInfo?.valid ?? 'N/A'}
- Response Headers: ${JSON.stringify(websiteData.responseHeaders || {}, null, 2)}

**Recent History (last 10 checks):**
${recentHistory.map(h => `- ${h.timeAdded}: ${h.status} (${h.responseTime}ms, HTTP ${h.httpStatusCode || 'N/A'})`).join('\n')}

Based on this information, provide:

1. **Failure Type**: Classify as one of: FRONTEND, BACKEND, NETWORK, DNS, SSL, CDN, DATABASE, API
2. **Severity**: Rate as LOW, MEDIUM, HIGH, or CRITICAL
3. **Summary**: A clear, non-technical explanation of what went wrong (2-3 sentences)
4. **Recommendations**: Specific steps to investigate and fix the issue (3-5 actionable items)
5. **Confidence**: Your confidence in this analysis (0.0 to 1.0)

Please respond ONLY with a valid JSON object in this exact format:
{
  "failureType": "BACKEND",
  "severity": "HIGH",
  "summary": "Your analysis summary here",
  "recommendations": "Your recommendations here",
  "confidence": 0.85
}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert website monitoring AI. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        // Parse the JSON response
        const analysis = JSON.parse(content) as AIAnalysisResult;
        
        // Validate the response has required fields
        if (!analysis.failureType || !analysis.severity || !analysis.summary || !analysis.recommendations) {
            throw new Error("Invalid AI response format");
        }

        return analysis;
    } catch (error) {
        console.error("AI analysis failed:", error);
        
        // Fallback analysis based on error type
        return generateFallbackAnalysis(websiteData);
    }
}

function generateFallbackAnalysis(data: EnhancedWebsiteStatusEvent): AIAnalysisResult {
    let failureType = "UNKNOWN";
    let severity = "MEDIUM";
    let summary = "Website is experiencing downtime";
    let recommendations = "Check server logs and network connectivity";

    // Basic classification based on error patterns
    if (data.errorType) {
        switch (data.errorType) {
            case 'TIMEOUT':
                failureType = "NETWORK";
                severity = "HIGH";
                summary = "Website is not responding within the expected time limit, indicating potential server overload or network issues.";
                recommendations = "1. Check server CPU and memory usage 2. Verify network connectivity 3. Review server logs for performance issues 4. Consider scaling resources if needed";
                break;
            case 'DNS_ERROR':
                failureType = "DNS";
                severity = "CRITICAL";
                summary = "DNS resolution is failing, making the website completely inaccessible to users.";
                recommendations = "1. Verify DNS configuration 2. Check domain registration status 3. Contact DNS provider 4. Ensure nameservers are responding";
                break;
            case 'SSL_ERROR':
                failureType = "SSL";
                severity = "HIGH";
                summary = "SSL certificate issues are preventing secure connections to the website.";
                recommendations = "1. Check SSL certificate expiration 2. Verify certificate installation 3. Test certificate chain 4. Renew certificate if needed";
                break;
            case 'CONNECTION_REFUSED':
                failureType = "BACKEND";
                severity = "CRITICAL";
                summary = "Server is actively refusing connections, indicating the web service is down or misconfigured.";
                recommendations = "1. Check if web server is running 2. Verify server configuration 3. Review firewall settings 4. Check for recent deployments";
                break;
            case 'HTTP_ERROR':
                if (data.httpStatusCode && data.httpStatusCode >= 500) {
                    failureType = "BACKEND";
                    severity = "HIGH";
                    summary = "Server is returning internal server errors, indicating backend application issues.";
                    recommendations = "1. Check application logs 2. Verify database connectivity 3. Review recent code deployments 4. Monitor server resources";
                } else if (data.httpStatusCode && data.httpStatusCode >= 400) {
                    failureType = "FRONTEND";
                    severity = "MEDIUM";
                    summary = "Website is returning client error responses, possibly due to configuration or routing issues.";
                    recommendations = "1. Check URL configuration 2. Verify routing rules 3. Review recent configuration changes 4. Test with different URLs";
                }
                break;
        }
    }

    return {
        failureType,
        severity,
        summary,
        recommendations,
        confidence: 0.7
    };
}

async function processFailureAnalysis() {
    try {
        // Read status update messages from Redis stream
        const messages = await xReadGroup(CONSUMER_GROUP, AI_ANALYZER_WORKER_ID);
        
        if (!messages || messages.length === 0) {
            console.log("No status messages to analyze");
            return;
        }

        console.log(`Processing ${messages.length} status updates for AI analysis...`);

        for (const { message, id } of messages) {
            try {
                const statusEvent = message as EnhancedWebsiteStatusEvent;
                
                // Only analyze failures
                if (statusEvent.status === 'UP') {
                    await xAck(CONSUMER_GROUP, id);
                    continue;
                }

                // Get website information
                const website = await prismaClient.website.findUnique({
                    where: { id: statusEvent.websiteId },
                    include: {
                        WebsiteTick: {
                            orderBy: { timeAdded: 'desc' },
                            take: 10,
                            select: {
                                status: true,
                                responseTime: true,
                                httpStatusCode: true,
                                timeAdded: true
                            }
                        }
                    }
                });

                if (!website) {
                    console.warn(`Website not found: ${statusEvent.websiteId}`);
                    await xAck(CONSUMER_GROUP, id);
                    continue;
                }

                // Store the enhanced website tick data
                const websiteTick = await prismaClient.websiteTick.create({
                    data: {
                        websiteId: statusEvent.websiteId,
                        regionId: "default-region", // You'll need to handle regions properly
                        status: statusEvent.status,
                        responseTime: statusEvent.responseTime,
                        httpStatusCode: statusEvent.httpStatusCode,
                        errorType: statusEvent.errorType,
                        errorMessage: statusEvent.errorMessage,
                        responseHeaders: statusEvent.responseHeaders as any,
                        dnsResolutionTime: statusEvent.dnsResolutionTime,
                        sslValid: statusEvent.sslInfo?.valid,
                        sslExpiryDate: statusEvent.sslInfo?.expiryDate ? new Date(statusEvent.sslInfo.expiryDate) : null,
                        sslIssuer: statusEvent.sslInfo?.issuer
                    }
                });

                // Perform AI analysis for failures
                const analysis = await analyzeFailure(
                    statusEvent,
                    website.url,
                    website.name,
                    website.WebsiteTick
                );

                // Store AI analysis results
                await prismaClient.aIAnalysis.create({
                    data: {
                        websiteTickId: websiteTick.id,
                        failureType: analysis.failureType,
                        severity: analysis.severity,
                        summary: analysis.summary,
                        recommendations: analysis.recommendations,
                        confidence: analysis.confidence,
                        model: "gpt-4",
                        tokens: 1000 // Estimate, you'd want to track actual tokens used
                    }
                });

                console.log(`✅ AI analysis completed for ${website.name}: ${analysis.failureType} (${analysis.severity})`);
                
                await xAck(CONSUMER_GROUP, id);
            } catch (error) {
                console.error(`Error processing message ${id}:`, error);
                // Don't acknowledge failed messages so they can be retried
            }
        }
    } catch (error) {
        console.error("Error in failure analysis process:", error);
    }
}

async function startAIAnalyzer() {
    console.log("🤖 Starting AI Failure Analyzer...");
    
    // Continuous processing loop
    while (true) {
        await processFailureAnalysis();
        
        // Wait before next iteration
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

// Start the AI analyzer
startAIAnalyzer().catch(console.error);
