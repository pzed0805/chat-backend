
import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/ApiError.js";

import {
    markMessageAsRead,
    updateLastSeenMessage
} from "./read-receipt.repository.js";

// Verify chat membership
const verifyMembership = async (
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

// Convert repository errors into API errors
const handleFirestoreError = (error: unknown): never => {

    if (error instanceof Error) {

        switch (error.message) {

            case "MESSAGE_NOT_FOUND":
                throw new ApiError(404, "Message not found");

            case "CANNOT_READ_OWN_MESSAGE":
                throw new ApiError(400, "You cannot mark your own message as read");

            case "MESSAGE_TIMESTAMP_NOT_AVAILABLE":
                throw new ApiError(409, "Message timestamp is not available yet");
        }
    }

    throw error;
};

// Mark message as read
export const markChatMessageRead = async (
    chatId: string,
    messageId: string,
    userId: string
) => {

    await verifyMembership(chatId, userId);

    try {
        return await markMessageAsRead(
            chatId,
            messageId,
            userId
        );
    } catch (error) {
        handleFirestoreError(error);
    }
};

// Update last seen
export const updateChatLastSeen = async (
    chatId: string,
    messageId: string,
    userId: string
) => {

    await verifyMembership(chatId, userId);

    try {
        return await updateLastSeenMessage(
            chatId,
            messageId,
            userId
        );
    } catch (error) {
        handleFirestoreError(error);
    }
};
