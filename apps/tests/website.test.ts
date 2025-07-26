import axios from "axios";
import {describe, expect, it, beforeAll} from "bun:test";
import { BACKEND_URL } from "./config.ts";

// Test data
const EMAIL = `user${Date.now()}${Math.floor(Math.random() * 1000)}@gmail.com`;
const USERNAME = `user${Math.random().toString().slice(2, 8)}`;
const PASSWORD = "password123";
const WEBSITE_NAME = "Test Website";
const WEBSITE_URL = "https://example.com";

let authToken: string;
let userId: string;
let websiteId: string;

// Setup: Register and login a user before running website tests
beforeAll(async () => {
    try {
        // Register user
        const registerRes = await axios.post(`${BACKEND_URL}/api/v1/register`, {
            name: USERNAME,
            email: EMAIL,
            password: PASSWORD
        });
        userId = registerRes.data.id;

        // Login to get token
        const loginRes = await axios.post(`${BACKEND_URL}/api/v1/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        authToken = loginRes.data.token;
    } catch (error) {
        console.error("Setup failed:", error);
        throw error;
    }
});

describe("Website endpoints", () => {
    describe("POST /api/v1/addWebsite", () => {
        it("Should fail to add website without authentication", async () => {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/v1/addWebsite`, {
                    name: WEBSITE_NAME,
                    url: WEBSITE_URL
                });
                expect(false, "Should not reach here - authentication required").toBe(true);
            } catch(error: any) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.message).toBe("Unauthorized");
            }
        });

        it("Should fail to add website with invalid token", async () => {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/v1/addWebsite`, {
                    name: WEBSITE_NAME,
                    url: WEBSITE_URL
                }, {
                    headers: {
                        Authorization: "Bearer invalid-token"
                    }
                });
                expect(false, "Should not reach here - invalid token").toBe(true);
            } catch(error: any) {
                expect(error.response.status).toBe(500); // JWT verification error
            }
        });

        it("Should successfully add website with valid authentication", async () => {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/v1/addWebsite`, {
                    name: WEBSITE_NAME,
                    url: WEBSITE_URL
                }, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                
                expect(res.status).toBe(200);
                expect(res.data.message).toBe("OK");
                expect(res.data.websiteId).toBeDefined();
                expect(res.data.websiteId.id).toBeDefined();
                
                // Store website ID for status tests
                websiteId = res.data.websiteId.id;
            } catch(error) {
                console.error("Add website failed:", error);
                throw error;
            }
        });

        it("Should add another website with different data", async () => {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/v1/addWebsite`, {
                    name: "Second Website",
                    url: "https://google.com"
                }, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                
                expect(res.status).toBe(200);
                expect(res.data.message).toBe("OK");
                expect(res.data.websiteId).toBeDefined();
            } catch(error) {
                console.error("Add second website failed:", error);
                throw error;
            }
        });
    });

    describe("GET /api/v1/status/:website_id", () => {
        it("Should fail to get website status without authentication", async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/status/${websiteId}`);
                expect(false, "Should not reach here - authentication required").toBe(true);
            } catch(error: any) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.message).toBe("Unauthorized");
            }
        });

        it("Should fail to get website status with invalid token", async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/status/${websiteId}`, {
                    headers: {
                        Authorization: "Bearer invalid-token"
                    }
                });
                expect(false, "Should not reach here - invalid token").toBe(true);
            } catch(error: any) {
                expect(error.response.status).toBe(500); // JWT verification error
            }
        });

        it("Should fail to get status for non-existent website", async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/status/non-existent-id`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                expect(false, "Should not reach here - website doesn't exist").toBe(true);
            } catch(error: any) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.message).toBe("Website not found");
            }
        });

        it("Should successfully get website status with valid authentication", async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/status/${websiteId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                
                expect(res.status).toBe(200);
                expect(res.data.id).toBe(websiteId);
                expect(res.data.name).toBe(WEBSITE_NAME);
                expect(res.data.url).toBe(WEBSITE_URL);
                expect(res.data.userId).toBe(userId);
                expect(res.data.timeAdded).toBeDefined();
                expect(res.data.WebsiteTick).toBeDefined();
                expect(Array.isArray(res.data.WebsiteTick)).toBe(true);
            } catch(error) {
                console.error("Get website status failed:", error);
                throw error;
            }
        });
    });

    describe("Authorization and ownership tests", () => {
        let secondUserToken: string;
        let secondUserWebsiteId: string;

        beforeAll(async () => {
            try {
                // Create a second user to test authorization
                const secondEmail = `user2${Date.now()}${Math.floor(Math.random() * 1000)}@gmail.com`;
                const secondUsername = `user2${Math.random().toString().slice(2, 8)}`;
                
                // Register second user
                await axios.post(`${BACKEND_URL}/api/v1/register`, {
                    name: secondUsername,
                    email: secondEmail,
                    password: PASSWORD
                });

                // Login second user
                const loginRes = await axios.post(`${BACKEND_URL}/api/v1/login`, {
                    email: secondEmail,
                    password: PASSWORD
                });
                secondUserToken = loginRes.data.token;

                // Create a website for second user
                const websiteRes = await axios.post(`${BACKEND_URL}/api/v1/addWebsite`, {
                    name: "Second User Website",
                    url: "https://seconduser.com"
                }, {
                    headers: {
                        Authorization: `Bearer ${secondUserToken}`
                    }
                });
                secondUserWebsiteId = websiteRes.data.websiteId.id;
            } catch (error) {
                console.error("Second user setup failed:", error);
                throw error;
            }
        });

        it("Should not allow user to access another user's website", async () => {
            try {
                // First user trying to access second user's website
                const res = await axios.get(`${BACKEND_URL}/api/v1/status/${secondUserWebsiteId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                expect(false, "Should not reach here - user should not access other's website").toBe(true);
            } catch(error: any) {
                expect(error.response.status).toBe(404);
                expect(error.response.data.message).toBe("Website not found");
            }
        });

        it("Should allow user to access their own website", async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/status/${secondUserWebsiteId}`, {
                    headers: {
                        Authorization: `Bearer ${secondUserToken}`
                    }
                });
                
                expect(res.status).toBe(200);
                expect(res.data.id).toBe(secondUserWebsiteId);
                expect(res.data.name).toBe("Second User Website");
            } catch(error) {
                console.error("Second user website access failed:", error);
                throw error;
            }
        });
    });
}); 