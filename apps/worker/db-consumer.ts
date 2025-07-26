import { xReadGroupStatus, xAckStatus, createConsumerGroups, type StatusMessageType } from "../../packages/redis-stream";
import { prismaClient } from "../../packages/db";

const REGION_ID = process.env.REGION_ID!;
const CONSUMER_ID = process.env.DB_CONSUMER_ID || 'db-consumer-1';
const CONSUMER_GROUP = 'status-processors';

interface DatabaseStatus {
    websiteId: string;
    regionId: string;
    status: 'UP' | 'DOWN' | 'UNKNOWN';
    responseTime: number;
    checkedAt: Date;
}

async function processBatchToDatabase(statuses: DatabaseStatus[]) {
    try {
        // Use Prisma's createMany for efficient batch inserts
        const result = await prismaClient.websiteTick.createMany({
            data: statuses.map(status => ({
                websiteId: status.websiteId,
                regionId: status.regionId,
                status: status.status,
                responseTime: status.responseTime,
                timeAdded: status.checkedAt
            })),
            skipDuplicates: true // Skip if there are any constraint violations
        });

        console.log(`✅ Inserted ${result.count} website status records to database`);
        return result.count;
    } catch (error) {
        console.error("Error inserting to database:", error);
        throw error;
    }
}

async function processStatusUpdates() {
    try {
        // Read status messages from the Redis stream
        const messages = await xReadGroupStatus(CONSUMER_GROUP, CONSUMER_ID);
        
        if (!messages || messages.length === 0) {
            console.log("No status updates to process");
            return;
        }

        console.log(`Processing ${messages.length} status updates...`);

        // Convert Redis stream messages to database format
        const statusUpdates: DatabaseStatus[] = messages.map((msg: StatusMessageType) => ({
            websiteId: msg.message.websiteId,
            regionId: msg.message.regionId,
            status: msg.message.status as 'UP' | 'DOWN' | 'UNKNOWN',
            responseTime: parseInt(msg.message.responseTime, 10),
            checkedAt: new Date(msg.message.checkedAt)
        }));

        // Insert all status updates to database in a single batch
        const insertedCount = await processBatchToDatabase(statusUpdates);

        // Acknowledge all processed messages only after successful database insert
        if (insertedCount > 0) {
            const ackPromises = messages.map((msg: StatusMessageType) => 
                xAckStatus(CONSUMER_GROUP, msg.id)
            );
            await Promise.all(ackPromises);
            console.log(`✅ Acknowledged ${messages.length} processed status messages`);

            // Log summary
            const upCount = statusUpdates.filter(s => s.status === 'UP').length;
            const downCount = statusUpdates.filter(s => s.status === 'DOWN').length;
            const unknownCount = statusUpdates.filter(s => s.status === 'UNKNOWN').length;
            console.log(`DB Summary - UP: ${upCount}, DOWN: ${downCount}, UNKNOWN: ${unknownCount}`);
        }

    } catch (error) {
        console.error("Error processing status updates:", error);
        // Don't acknowledge messages if there was an error - they'll be retried
    }
}

async function startDatabaseConsumer() {
    console.log(`🗄️ Starting database consumer ${CONSUMER_ID} for region ${REGION_ID}`);
    
    // Ensure consumer groups exist
    await createConsumerGroups();
    
    // Check database connection
    try {
        await prismaClient.$connect();
        console.log("✅ Connected to database");
    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
        process.exit(1);
    }
    
    // Continuous processing loop
    while (true) {
        await processStatusUpdates();
        
        // Wait a bit before next iteration
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down database consumer...');
    await prismaClient.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down database consumer...');
    await prismaClient.$disconnect();
    process.exit(0);
});

// Start the database consumer
if (require.main === module) {
    startDatabaseConsumer().catch(async (error) => {
        console.error("Database consumer failed:", error);
        await prismaClient.$disconnect();
        process.exit(1);
    });
}

export { startDatabaseConsumer, processStatusUpdates }; 