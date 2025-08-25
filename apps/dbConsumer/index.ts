import { prismaClient } from "db/client";
import { xReadGroupStatus, xAckStatus, createConsumerGroups, type StatusMessageType } from "redis-stream/client";

const CONSUMER_GROUP = "status-processors";
const CONSUMER_ID = process.env.DB_CONSUMER_ID || "db-consumer-1";
const DEFAULT_REGION_ID = "us-east-1"; // Default region for status updates

interface ProcessedStatus {
    websiteId: string;
    status: 'UP' | 'DOWN' | 'UNKNOWN';
    responseTime: number;
    checkedAt: Date;
    regionId: string;
}

async function ensureConsumerGroup() {
    try {
        console.log("🔧 Setting up consumer groups...");
        await createConsumerGroups();
        
        // Create status-processors consumer group
        const { redisClient } = await import("redis-stream/client");
        await (await redisClient).xGroupCreate('betteruptime:website:status', CONSUMER_GROUP, '0', { MKSTREAM: true });
        console.log(`✅ Created consumer group: ${CONSUMER_GROUP}`);
    } catch (error: any) {
        if (!error.message.includes('BUSYGROUP')) {
            console.error('❌ Error creating status-processors group:', error);
        } else {
            console.log(`✅ Consumer group ${CONSUMER_GROUP} already exists`);
        }
    }
}

async function ensureDefaultRegion() {
    try {
        // Check if default region exists, if not create it
        const existingRegion = await prismaClient.region.findUnique({
            where: { id: DEFAULT_REGION_ID }
        });
        
        if (!existingRegion) {
            console.log("📍 Creating default region...");
            await prismaClient.region.create({
                data: {
                    id: DEFAULT_REGION_ID,
                    name: "US East 1"
                }
            });
            console.log(`✅ Created default region: ${DEFAULT_REGION_ID}`);
        }
    } catch (error) {
        console.error("❌ Error ensuring default region:", error);
    }
}

async function processStatusMessages(): Promise<void> {
    try {
        console.log(`📥 Reading status messages from stream...`);
        
        // Read messages from status stream
        const messages = await xReadGroupStatus(CONSUMER_GROUP, CONSUMER_ID);
        
        if (!messages || messages.length === 0) {
            console.log("📭 No new status messages");
            return;
        }

        console.log(`📨 Processing ${messages.length} status messages`);

        // Process each message and prepare for batch insert
        const statusUpdates: ProcessedStatus[] = [];
        const messagesToAck: string[] = [];

        for (const message of messages) {
            try {
                const { websiteId, status, responseTime, checkedAt } = message.message;
                
                // Validate the status message
                if (!websiteId || !status || !responseTime || !checkedAt) {
                    console.warn(`⚠️  Invalid status message format:`, message);
                    continue;
                }

                // Validate status value
                if (!['UP', 'DOWN', 'UNKNOWN'].includes(status)) {
                    console.warn(`⚠️  Invalid status value: ${status}`);
                    continue;
                }

                const processedStatus: ProcessedStatus = {
                    websiteId,
                    status: status as 'UP' | 'DOWN' | 'UNKNOWN',
                    responseTime: parseInt(responseTime),
                    checkedAt: new Date(checkedAt),
                    regionId: message.message.regionId || DEFAULT_REGION_ID // Use provided regionId or default
                };

                statusUpdates.push(processedStatus);
                messagesToAck.push(message.id);
                
            } catch (error) {
                console.error(`❌ Error processing message ${message.id}:`, error);
                // Don't acknowledge failed messages - they will be retried
            }
        }

        // Batch insert to database
        if (statusUpdates.length > 0) {
            await batchInsertWebsiteTicks(statusUpdates);
            
            // Acknowledge processed messages
            for (const messageId of messagesToAck) {
                try {
                    await xAckStatus(CONSUMER_GROUP, messageId);
                } catch (error) {
                    console.error(`❌ Error acknowledging message ${messageId}:`, error);
                }
            }
            
            console.log(`✅ Successfully processed ${statusUpdates.length} status updates`);
        }

    } catch (error) {
        console.error("❌ Error processing status messages:", error);
    }
}

async function batchInsertWebsiteTicks(statusUpdates: ProcessedStatus[]): Promise<void> {
    try {
        console.log(`💾 Inserting ${statusUpdates.length} website ticks into database`);
        
        // Prepare data for batch insert
        const ticksData = statusUpdates.map(status => ({
            websiteId: status.websiteId,
            regionId: status.regionId,
            status: status.status,
            responseTime: status.responseTime,
            timeAdded: status.checkedAt
        }));

        // Use Prisma's createMany for batch insert
        const result = await prismaClient.websiteTick.createMany({
            data: ticksData,
            skipDuplicates: true // Skip any duplicates that might occur
        });

        console.log(`✅ Successfully inserted ${result.count} website ticks`);
        
    } catch (error) {
        console.error("❌ Error inserting website ticks:", error);
        throw error; // Re-throw to prevent acknowledgment of messages
    }
}

async function startStatusProcessor(): Promise<void> {
    console.log("🚀 Starting DB Consumer for website status processing");
    console.log(`📋 Consumer Group: ${CONSUMER_GROUP}`);
    console.log(`🆔 Consumer ID: ${CONSUMER_ID}`);
    
    try {
        // Ensure consumer groups and default region exist
        await ensureConsumerGroup();
        await ensureDefaultRegion();
        
        console.log("✅ Initialization complete");
        console.log("⏰ Processing status messages every 2 minutes...");
        
        // Process messages immediately on startup
        await processStatusMessages();
        
        // Set up interval to process messages every 2 minutes (120,000 ms)
        setInterval(async () => {
            await processStatusMessages();
        }, 2 * 60 * 1000); // 2 minutes
        
    } catch (error) {
        console.error("❌ Failed to start status processor:", error);
        process.exit(1);
    }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await prismaClient.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await prismaClient.$disconnect();
    process.exit(0);
});

// Start the processor
startStatusProcessor().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});