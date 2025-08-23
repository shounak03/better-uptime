
import { xReadGroup, xAck, addWebsiteStatuses, createConsumerGroups, type WebsiteStatusEvent } from "redis-stream/client"

//check if regionId ad workerId actually exists in the db
const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;
const CONSUMER_GROUP = 'website-checkers';

interface WebsiteStatus {
    websiteId: string
    status: string
    regionId: string
    responseTime: number
    checkedAt: string
}

const fetchWebsite = async(url: string, website_id: string): Promise<WebsiteStatus> => {
    //check whether the websites are up or down(minimum three retries)
    //create an object of {websiteId, RegionId, status}

    const startTime = Date.now();
    const res = await checkUrlStatusWithRetries(url);
    const responseTime = Date.now() - startTime;

    return {
        websiteId: website_id,
        status: res === true ? 'UP' : 'DOWN',
        regionId: REGION_ID,
        responseTime,
        checkedAt: new Date().toISOString()
    };
}

async function checkUrlStatusWithRetries(url: string, retries = 3, delay = 1000): Promise<boolean> {
    const corrUrl = `https://${url}`;
    try {
        const response = await fetch(corrUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
        if (response.ok) {
            console.log(`✅ URL is up: ${url} (Status: ${response.status})`);
            return true;
        } else {
            console.warn(`⚠️ URL responded with status: ${response.status}`);
            return false;
        }
    } catch (error: any) {
        if (retries > 0) {
            console.warn(`Retrying ${url}... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, delay));
            return checkUrlStatusWithRetries(url, retries - 1, delay);
        } else {
            console.error(`❌ Failed to fetch ${url} after retries:`, error.message);
            return false;
        }
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
            regionId: status.regionId,
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
    console.log(`🚀 Starting worker ${WORKER_ID} in region ${REGION_ID}`);
    
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
