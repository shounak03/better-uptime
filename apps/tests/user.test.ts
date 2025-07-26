
// import axios from "axios";
// import {describe, expect, it, test} from "bun:test";
// import { BACKEND_URL } from "./config.ts";

// const EMAIL = `user${Date.now()}${Math.floor(Math.random() * 1000)}@gmail.com`;
// const USERNAME = `user${Math.random().toString().slice(2, 8)}`;
// const PASSWORD = "password123"; // Minimum 8 characters required

// describe("Register endpoints", () => {
//     it("Should fail to register with missing fields", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/register`, {
//                 email: EMAIL,
//                 // Missing name and password
//             });
//             expect(false, "Should not reach here - request should fail").toBe(true);
//         } catch(error: any) {
//             expect(error.response.status).toBe(403);
//             expect(error.response.data.message).toBe("Name, email and password are required");
//         }
//     });

//     it("Should fail to register with invalid email", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/register`, {
//                 name: USERNAME,
//                 email: "invalid-email",
//                 password: PASSWORD
//             });
//             expect(false, "Should not reach here - request should fail").toBe(true);
//         } catch(error: any) {
//             expect(error.response.status).toBe(403);
//         }
//     });

//     it("Should fail to register with short password", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/register`, {
//                 name: USERNAME,
//                 email: EMAIL,
//                 password: "short"
//             });
//             expect(false, "Should not reach here - request should fail").toBe(true);
//         } catch(error: any) {
//             expect(error.response.status).toBe(403);
//         }
//     });

//     it("Should successfully register with valid data", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/register`, {
//                 name: USERNAME,
//                 email: EMAIL,
//                 password: PASSWORD
//             });
            
//             expect(res.status).toBe(200);
//             expect(res.data.id).toBeDefined();
//             expect(typeof res.data.id).toBe("string");
//         } catch(error) {
//             console.error("Registration failed:", error);
//             throw error;
//         }
//     });

//     it("Should fail to register with existing email", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/register`, {
//                 name: USERNAME,
//                 email: EMAIL, // Same email as previous test
//                 password: PASSWORD
//             });
//             expect(false, "Should not reach here - user already exists").toBe(true);
//         } catch(error: any) {
//             expect(error.response.status).toBe(400);
//             expect(error.response.data.message).toBe("User already exists");
//         }
//     });
// });

// describe("Login endpoints", () => {
//     it("Should fail to login with missing fields", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/login`, {
//                 email: EMAIL,
//                 // Missing password
//             });
//             expect(false, "Should not reach here - request should fail").toBe(true);
//         } catch(error: any) {
//             expect(error.response.status).toBe(403);
//             expect(error.response.data.message).toBe("email and password are required");
//         }
//     });

//     it("Should fail to login with non-existent user", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/login`, {
//                 email: "nonexistent@example.com",
//                 password: PASSWORD
//             });
//             expect(false, "Should not reach here - user doesn't exist").toBe(true);
//         } catch(error: any) {
//             expect(error.response.status).toBe(404);
//             expect(error.response.data.message).toBe("User not found");
//         }
//     });

//     it("Should fail to login with wrong password", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/login`, {
//                 email: EMAIL,
//                 password: "wrongpassword123"
//             });
//             expect(false, "Should not reach here - wrong password").toBe(true);
//         } catch(error: any) {
//             expect(error.response.status).toBe(403);
//             expect(error.response.data.message).toBe("Invalid password");
//         }
//     });

//     it("Should successfully login with correct credentials", async () => {
//         try {
//             const res = await axios.post(`${BACKEND_URL}/api/v1/login`, {
//                 email: EMAIL,
//                 password: PASSWORD
//             });
            
//             expect(res.status).toBe(200);
//             expect(res.data.token).toBeDefined();
//             expect(typeof res.data.token).toBe("string");
//         } catch(error) {
//             console.error("Login failed:", error);
//             throw error;
//         }
//     });
// });