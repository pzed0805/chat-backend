import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(5000),

    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    DATABASE_URL: z.string().min(1),

    JWT_SECRET: z.string().min(32),

    JWT_EXPIRES_IN: z.string().default("1d"),

    FIREBASE_PROJECT_ID: z.string().min(1),

    GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        "Invalid environment variables:",
        z.treeifyError(parsedEnv.error)
    );

    throw new Error("Environment validation failed");
}

export const env = parsedEnv.data;