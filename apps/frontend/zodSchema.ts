import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})
export const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
})
export const addWebsiteSchema = z.object({
    name: z.string().min(5),
    url: z.string().url(),
})
