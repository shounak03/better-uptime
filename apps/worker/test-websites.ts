import { addWebsites, createConsumerGroups } from "../../packages/redis-stream";
import { prismaClient } from "../../packages/db";

// Sample websites to test
const TEST_WEBSITES = [
    { id: "test-1", url: "google.com" },
    { id: "test-2", url: "github.com" },
    { id: "test-3", url: "stackoverflow.com" },
    { id: "test-4", url: "invalid-website-12345.com" }, // This should fail
    { id: "test-5", url: "httpbin.org" },
];

async function setupTestData() {
    console.log("🔧 Setting up test data...");
    
    try {
        // Ensure consumer groups exist
        await createConsumerGroups();
        
        // Check if we need to create regions in database
        const regionCount = await prismaClient.region.count();
        if (regionCount === 0) {
            console.log("📍 Creating test region...");
            await prismaClient.region.create({
                data: {
                    id: "us-east-1",
                    name: "US East 1"
                }
            });
        }
        
        // Check if we need to create websites in database
        const websiteCount = await prismaClient.website.count();
        if (websiteCount === 0) {
            console.log("🌐 Creating test user and websites...");
            
            // Create a test user
            const testUser = await prismaClient.user.create({
                data: {
                    name: "Test User",
                    email: "test@example.com",
                    password: "hashed_password" // In real app, this would be properly hashed
                }
            });
            
            // Create test websites
            for (const site of TEST_WEBSITES) {
                await prismaClient.website.create({
                    data: {
                        id: site.id,
                        name: site.url,
                        url: site.url,
                        userId: testUser.id
                    }
                });
            }
        }
        
        console.log("✅ Test data setup complete");
        
    } catch (error) {
        console.error("❌ Error setting up test data:", error);
        throw error;
    }
}

async function addTestWebsitesToStream() {
    console.log("📡 Adding test websites to Redis stream...");
    
    try {
        await addWebsites(TEST_WEBSITES);
        console.log(`✅ Added ${TEST_WEBSITES.length} websites to stream:`);
        TEST_WEBSITES.forEach(site => {
            console.log(`   • ${site.id}: ${site.url}`);
        });
        
    } catch (error) {
        console.error("❌ Error adding websites to stream:", error);
        throw error;
    }
}

async function showStatus() {
    console.log("\n📊 Architecture Status:");
    console.log("====================");
    console.log("1. ✅ Test websites added to Redis stream 'betteruptime:website'");
    console.log("2. 🔄 Start workers with: bun run start");
    console.log("3. 👀 Watch for status updates in Redis stream 'betteruptime:website:status'");
    console.log("4. 💾 Check database for WebsiteTick records");
    console.log("\n📋 Test Websites:");
    TEST_WEBSITES.forEach((site, i) => {
        const status = site.url.includes("invalid") ? "(Should fail)" : "(Should pass)";
        console.log(`   ${i + 1}. ${site.url} ${status}`);
    });
    
    console.log("\n🚀 To start the worker architecture:");
    console.log("   cd apps/worker");
    console.log("   REGION_ID=us-east-1 WORKER_ID=test-worker bun run start");
}

async function main() {
    console.log("🧪 Better Uptime - Test Website Setup");
    console.log("====================================");
    
    try {
        await setupTestData();
        await addTestWebsitesToStream();
        await showStatus();
        
    } catch (error) {
        console.error("❌ Test setup failed:", error);
        process.exit(1);
    } finally {
        await prismaClient.$disconnect();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

export { setupTestData, addTestWebsitesToStream }; 