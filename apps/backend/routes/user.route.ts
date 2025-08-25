import { Router } from "express";
import { prismaClient } from "db/client";
import { loginSchema, registerSchema } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
dotenv.config();

const router = Router();



router.post("/api/v1/login", async (req, res) => {
    const data = loginSchema.safeParse(req.body);
    
    if(!data.success) {
        return res.status(403).json({ message: "email and password are required" });
    }
    const { email, password } = data.data;
    const user = await prismaClient.user.findUnique({
        where: {
            email
        },
        select: {
            id:true,
            password: true,
        }
    })
    if(!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
        return res.status(403).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24, 
      });   
    return res.status(200).json({ message: "Logged in successfully" });
});

router.post("/api/v1/register", async (req, res) => {
    const data = registerSchema.safeParse(req.body);
    if(!data.success) {
        return res.status(403).json({ message: "Name, email and password are required" });
    }
    try {
        const { name, email, password } = data.data;
        const existingUser = await prismaClient.user.findUnique({
            where: {
                email
            }
        })
        if(existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await prismaClient.user.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, 10),
            }
        })
        return res.status(200).json({id:user.id});
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
});

router.post("/api/v1/logout", (req, res) => {
    console.log("Logout endpoint called");
    console.log("Current cookies:", req.cookies);
    
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/", // Ensure the path matches the cookie set path
    });
    
    console.log("Cookie cleared, sending success response");
    return res.status(200).json({ message: "Logged out successfully" });
});

export default router;