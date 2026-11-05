import { prisma } from "../../config/database.js";

import { ApiError } from "../../utils/ApiError.js";

import {
    createMessage,
    getMessages
} from "./message.repository.js";

// Check whether user belongs to chat
const verifyChatMembership = async (
    chatId: string,
    userId: string
): Promise<void> => {

    const membership = await prisma.chatMember.findFirst({
        where: {
            chatId,
            userId
        }
    });

    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of this chat"
        );
    }
};

// Send message
export const sendChatMessage = async (
    chatId: string,
    senderId: string,
    text: string
) => {

    await verifyChatMembership(chatId, senderId);

    const message = await createMessage(
        chatId,
        senderId,
        text
    );

    // Update chat activity in PostgreSQL
    await prisma.chat.update({
        where: {
            id: chatId
        },
        data: {
            updatedAt: new Date()
        }
    });

    return message;
};

// Get chat messages
export const fetchChatMessages = async (
    chatId: string,
    userId: string,
    limit: number,
    cursor?: string
) => {

    await verifyChatMembership(chatId, userId);

    try {
        return await getMessages(
            chatId,
            limit,
            cursor
        );
    } catch (error) {

        if (
            error instanceof Error &&
            error.message === "Invalid message cursor"
        ) {
            throw new ApiError(400, error.message);
        }

        throw error;
    }
};