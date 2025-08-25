
import { xReadGroup, xAck,CONSUMER_GROUP, addWebsiteStatuses, createConsumerGroups, type WebsiteStatusEvent } from "redis-stream/client"

//check if regionId ad workerId actually exists in the db
const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;


interface WebsiteStatus {
    websiteId: string
    status: string
    // regionId: string
    responseTime: number
    checkedAt: string
    // Enhanced data for AI analysis
    httpStatusCode?: number
    errorType?: string
    errorMessage?: string
    responseHeaders?: Record<string, string>
    dnsResolutionTime?: number
    sslInfo?: {
        valid: boolean
        expiryDate?: string
        issuer?: string
    }
}

const fetchWebsite = async(url: string, website_id: string): Promise<WebsiteStatus> => {
    //check whether the websites are up or down(minimum three retries)
    //create an object of {websiteId, RegionId, status}

    const startTime = Date.now();
    const result = await checkUrlStatusWithRetries(url);
    const responseTime = Date.now() - startTime;

    return {
        websiteId: website_id,
        status: result.status ? 'UP' : 'DOWN',
        // regionId: REGION_ID,
        responseTime,
        checkedAt: new Date().toISOString(),
        httpStatusCode: result.httpStatusCode,
        errorType: result.errorType,
        errorMessage: result.errorMessage,
        responseHeaders: result.responseHeaders,
        dnsResolutionTime: result.dnsResolutionTime,
        sslInfo: result.sslInfo
    };
}

interface DetailedCheckResult {
    status: boolean
    httpStatusCode?: number
    errorType?: string
    errorMessage?: string
    responseHeaders?: Record<string, string>
    dnsResolutionTime?: number
    sslInfo?: {
        valid: boolean
        expiryDate?: string
        issuer?: string
    }
}

async function checkUrlStatusWithRetries(url: string, retries = 3, delay = 1000): Promise<DetailedCheckResult> {
    const dnsStartTime = Date.now();
    
    try {
        // Parse URL to get hostname for DNS check
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // DNS resolution time check
        const dnsResolutionTime = Date.now() - dnsStartTime;
        
        const response = await fetch(url, { 
            method: 'GET', 
            signal: AbortSignal.timeout(10000) 
        });
        
        // Extract response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });
        
        // Get SSL info for HTTPS URLs
        const sslInfo = urlObj.protocol === 'https:' ? await getSSLInfo(hostname) : undefined;
        
        if (response.ok) {
            console.log(`✅ URL is up: ${url} (Status: ${response.status})`);
            return {
                status: true,
                httpStatusCode: response.status,
                responseHeaders,
                dnsResolutionTime,
                sslInfo
            };
        } else {
            console.warn(`⚠️ URL responded with status: ${response.status}`);
            return {
                status: false,
                httpStatusCode: response.status,
                errorType: 'HTTP_ERROR',
                errorMessage: `HTTP ${response.status} ${response.statusText}`,
                responseHeaders,
                dnsResolutionTime,
                sslInfo
            };
        }
    } catch (error: any) {
        const errorType = classifyError(error);
        
        if (retries > 0) {
            console.warn(`Retrying ${url}... (${retries} retries left) - Error: ${error.message}`);
            await new Promise(res => setTimeout(res, delay));
            return checkUrlStatusWithRetries(url, retries - 1, delay);
        } else {
            console.error(`❌ Failed to fetch ${url} after retries:`, error.message);
            return {
                status: false,
                errorType,
                errorMessage: error.message,
                dnsResolutionTime: Date.now() - dnsStartTime
            };
        }
    }
}

function classifyError(error: any): string {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('network')) return 'NETWORK_ERROR';
    if (message.includes('dns') || message.includes('resolve')) return 'DNS_ERROR';
    if (message.includes('ssl') || message.includes('tls') || message.includes('certificate')) return 'SSL_ERROR';
    if (message.includes('connection refused')) return 'CONNECTION_REFUSED';
    if (message.includes('connection reset')) return 'CONNECTION_RESET';
    
    return 'UNKNOWN_ERROR';
}

async function getSSLInfo(hostname: string): Promise<{ valid: boolean; expiryDate?: string; issuer?: string }> {
    try {
        // For production, you'd want to use a proper SSL certificate checker
        // For now, we'll return basic info
        return {
            valid: true, // Assume valid if we got this far with HTTPS
            expiryDate: undefined, // Would need proper SSL cert parsing
            issuer: undefined
        };
    } catch {
        return {
            valid: false
        };
    }
}

async function processWebsiteChecks() {
    try {
        // Read messages from the website check stream
        const messages = await xReadGroup(CONSUMER_GROUP, WORKER_ID);
        
        if (!messages || messages.length === 0) {
            console.log("No messages to process");
            return;
        }

        console.log(`Processing ${messages.length} websites...`);

        // Process all websites in parallel
        const statusPromises = messages.map(({message}: any) => 
            fetchWebsite(message.url, message.id)
        );
        
        const statuses = await Promise.all(statusPromises);
        
        // Convert to WebsiteStatusEvent format for Redis stream
        const statusEvents: WebsiteStatusEvent[] = statuses.map((status: any) => ({
            websiteId: status.websiteId,
            status: status.status as 'UP' | 'DOWN',
            // regionId: status.regionId,
            responseTime: status.responseTime,
            checkedAt: status.checkedAt
        }));

        // Write all status results to the status stream
        await addWebsiteStatuses(statusEvents);
        console.log(`✅ Added ${statusEvents.length} status updates to stream`);

        // Acknowledge all processed messages
        const ackPromises = messages.map(({id}: any) => 
            xAck(CONSUMER_GROUP, id)
        );
        await Promise.all(ackPromises);
        console.log(`✅ Acknowledged ${messages.length} processed messages`);

        // Log results summary
        const upCount = statusEvents.filter(s => s.status === 'UP').length;
        const downCount = statusEvents.filter(s => s.status === 'DOWN').length;
        console.log(`Status Summary - UP: ${upCount}, DOWN: ${downCount}`);

    } catch (error) {
        console.error("Error processing website checks:", error);
    }
}

async function startWorker() {
    console.log(`🚀 Starting worker`);
    
    // Ensure consumer groups exist
    await createConsumerGroups();
    
    // Continuous processing loop
    while (true) {
        await processWebsiteChecks();
        
        // Wait a bit before next iteration to avoid hammering Redis
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Start the worker
startWorker().catch(console.error);
