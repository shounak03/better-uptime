import { Router } from "express";
import { prismaClient } from "db/client";
import { loginSchema, registerSchema } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
dotenv.config();

const router = Router();



router.post("/api/v1/login", async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    if(!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await prismaClient.user.findUnique({
        where: {
            email
        },select: {
            id:true,
            password: true,
        }
    })
    if(!user) {
        return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "24h" });
    return res.status(200).json({ token });
});

router.post("/api/v1/register", async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);
    if(!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
    }
    const user = await prismaClient.user.create({
        data: {
            name,
            email,
            password: await bcrypt.hash(password, 10),
        }
    })
    return res.status(200).json(user.id);
})

export default router;