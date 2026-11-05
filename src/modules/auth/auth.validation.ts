import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(100),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .transform(value => value.toLowerCase()),

    password: z
        .string()
        .min(8, "Password must contain at least 8 characters")
        .max(72, "Password must not exceed 72 characters")
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email()
        .transform(value => value.toLowerCase()),

    password: z.string().min(1, "Password is required")
});