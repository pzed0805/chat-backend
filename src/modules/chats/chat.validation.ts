import { z } from "zod";

export const createChatSchema = z.object({
    userAId: z.string().uuid("Invalid userAId"),
    userBId: z.string().uuid("Invalid userBId")
}).refine(
    data => data.userAId !== data.userBId,
    {
        message: "You cannot create a chat with yourself"
    }
);



export const sendMessageSchema = z.object({
    text: z
        .string()
        .trim()
        .min(1, "Message cannot be empty")
        .max(5000, "Message cannot exceed 5000 characters")
});

export const getMessagesSchema = z.object({
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),

    cursor: z.string().optional()
});

export const markMessageReadSchema = z.object({
    userId: z.string().uuid()
});

export const updateLastSeenSchema = z.object({
    userId: z.string().uuid(),
    messageId: z.string().min(1)
});