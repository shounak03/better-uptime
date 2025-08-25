# AI Monitoring Examples

Here are real-world examples of how the AI-based log monitoring system would analyze different types of failures:

## Example 1: Backend Database Connection Failure

### Raw Monitoring Data
```json
{
  "websiteId": "abc-123",
  "status": "DOWN",
  "httpStatusCode": 500,
  "errorType": "HTTP_ERROR",
  "errorMessage": "HTTP 500 Internal Server Error",
  "responseTime": 30000,
  "dnsResolutionTime": 45,
  "responseHeaders": {
    "server": "nginx/1.18.0",
    "content-type": "text/html",
    "x-error": "database_connection_timeout"
  }
}
```

### AI Analysis Result
```json
{
  "failureType": "BACKEND",
  "severity": "CRITICAL",
  "summary": "Your website is experiencing a critical backend failure. The server is responding with HTTP 500 errors, indicating an internal application problem. The error headers suggest a database connection timeout, which means your application cannot connect to its database.",
  "recommendations": "1. Check your database server status and connectivity 2. Verify database connection pools aren't exhausted 3. Review recent database configuration changes 4. Monitor database CPU and memory usage 5. Check for long-running queries that might be blocking connections",
  "confidence": 0.92
}
```

### Dashboard Display
- **Alert Level**: 🚨 CRITICAL
- **Problem Type**: BACKEND
- **What Happened**: Clear explanation that the database is unreachable
- **Next Steps**: Specific database troubleshooting steps
- **Confidence**: 92% sure this is a database issue

---

## Example 2: SSL Certificate Expiry

### Raw Monitoring Data
```json
{
  "websiteId": "def-456",
  "status": "DOWN",
  "httpStatusCode": null,
  "errorType": "SSL_ERROR",
  "errorMessage": "certificate verify failed: certificate has expired",
  "responseTime": 5000,
  "dnsResolutionTime": 23,
  "sslInfo": {
    "valid": false,
    "expiryDate": "2024-08-20T00:00:00Z"
  }
}
```

### AI Analysis Result
```json
{
  "failureType": "SSL",
  "severity": "HIGH",
  "summary": "Your website's SSL certificate has expired, making it inaccessible to users via HTTPS. This is a security issue that browsers will block, showing warning pages to visitors instead of your website.",
  "recommendations": "1. Renew your SSL certificate immediately through your certificate provider 2. Update the certificate on your web server 3. Verify the new certificate is properly installed 4. Set up automatic certificate renewal to prevent future expiry 5. Test HTTPS connectivity after renewal",
  "confidence": 0.98
}
```

### Dashboard Display
- **Alert Level**: ⚠️ HIGH
- **Problem Type**: SSL
- **What Happened**: SSL certificate expired, blocking secure access
- **Next Steps**: Certificate renewal and installation steps
- **Confidence**: 98% sure this is an SSL certificate issue

---

## Example 3: DNS Resolution Failure

### Raw Monitoring Data
```json
{
  "websiteId": "ghi-789",
  "status": "DOWN",
  "httpStatusCode": null,
  "errorType": "DNS_ERROR",
  "errorMessage": "getaddrinfo ENOTFOUND example.com",
  "responseTime": 15000,
  "dnsResolutionTime": null
}
```

### AI Analysis Result
```json
{
  "failureType": "DNS",
  "severity": "CRITICAL",
  "summary": "Your website's domain name cannot be resolved by DNS servers, making it completely inaccessible to users. This could be due to domain expiry, nameserver issues, or DNS configuration problems.",
  "recommendations": "1. Check if your domain registration is current and not expired 2. Verify your nameservers are responding and configured correctly 3. Test DNS resolution from different locations using tools like dig or nslookup 4. Contact your DNS provider if issues persist 5. Check for recent DNS configuration changes",
  "confidence": 0.95
}
```

### Dashboard Display
- **Alert Level**: 🚨 CRITICAL
- **Problem Type**: DNS
- **What Happened**: Domain name cannot be resolved
- **Next Steps**: Domain and DNS troubleshooting steps
- **Confidence**: 95% sure this is a DNS issue

---

## Example 4: CDN/Frontend Issue

### Raw Monitoring Data
```json
{
  "websiteId": "jkl-012",
  "status": "DOWN",
  "httpStatusCode": 404,
  "errorType": "HTTP_ERROR",
  "errorMessage": "HTTP 404 Not Found",
  "responseTime": 1200,
  "dnsResolutionTime": 18,
  "responseHeaders": {
    "server": "cloudflare",
    "cf-ray": "1234567890abcdef-LAX",
    "cache-control": "no-cache"
  }
}
```

### AI Analysis Result
```json
{
  "failureType": "FRONTEND",
  "severity": "MEDIUM",
  "summary": "Your website is returning 404 Not Found errors, suggesting that the requested pages or resources cannot be found. Since the response is coming through Cloudflare (based on headers), this appears to be a frontend routing or file serving issue rather than a complete server failure.",
  "recommendations": "1. Check if recent deployments removed or moved files 2. Verify your web server configuration and routing rules 3. Review Cloudflare cache settings and purge if necessary 4. Test direct server access bypassing CDN 5. Check for any recent configuration changes to your web server",
  "confidence": 0.85
}
```

### Dashboard Display
- **Alert Level**: ⚡ MEDIUM
- **Problem Type**: FRONTEND
- **What Happened**: Pages not found, likely routing or deployment issue
- **Next Steps**: Check recent deployments and server configuration
- **Confidence**: 85% sure this is a frontend configuration issue

---

## Example 5: Network Connectivity Issue

### Raw Monitoring Data
```json
{
  "websiteId": "mno-345",
  "status": "DOWN",
  "httpStatusCode": null,
  "errorType": "TIMEOUT",
  "errorMessage": "Request timeout after 10000ms",
  "responseTime": 10000,
  "dnsResolutionTime": 25
}
```

### AI Analysis Result
```json
{
  "failureType": "NETWORK",
  "severity": "HIGH",
  "summary": "Your website is not responding within the expected time limit, indicating potential network connectivity issues or server overload. DNS resolution is working (25ms), but the actual connection is timing out, suggesting the server is unreachable or overwhelmed.",
  "recommendations": "1. Check your server's network connectivity and firewall settings 2. Monitor server CPU and memory usage for overload conditions 3. Verify your hosting provider's network status 4. Test connectivity from different locations 5. Review recent changes to network configuration or security groups",
  "confidence": 0.78
}
```

### Dashboard Display
- **Alert Level**: ⚠️ HIGH
- **Problem Type**: NETWORK
- **What Happened**: Server not responding, network or overload issue
- **Next Steps**: Check server resources and network connectivity
- **Confidence**: 78% sure this is a network connectivity issue

---

## Dashboard Benefits

### For Non-Technical Users
- **Plain English Explanations**: No technical jargon, clear problem descriptions
- **Severity Color Coding**: Instant visual priority assessment
- **Action-Oriented**: Specific steps they can take or delegate

### For Technical Teams
- **Quick Diagnosis**: Immediate classification saves investigation time
- **Historical Patterns**: Track recurring issues and root causes
- **Confidence Scoring**: Know when to trust AI vs. investigate further
- **Rich Context**: Full error details alongside AI insights

### Business Impact
- **Faster Resolution**: AI guidance reduces mean time to repair (MTTR)
- **Proactive Maintenance**: Identify issues before they become critical
- **Cost Efficiency**: Fewer support tickets and engineering time
- **Better Reliability**: Learn from failure patterns to prevent recurrence
