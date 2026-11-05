import { Prisma } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/ApiError.js";

import {
    findDirectChat,
    findUsers,
    createDirectChat,
    findUserChats,
    isChatMember
} from "./chat.repository.js";

import {
    CreateChatInput
} from "./chat.types.js";

// Generate a consistent key regardless of user order
const generateDirectKey = (
    userAId: string,
    userBId: string
): string => {

    return [userAId, userBId]
        .sort()
        .join("_");
};

// Create or get existing direct chat
export const createOrGetChat = async (
    input: CreateChatInput,
    authenticatedUserId: string
) => {

    const { userAId, userBId } = input;

    // Verify that the logged-in user is a participant
    if (
        authenticatedUserId !== userAId &&
        authenticatedUserId !== userBId
    ) {
        throw new ApiError(
            403,
            "You can only create chats involving yourself"
        );
    }

    // Generate canonical key
    const directKey = generateDirectKey(
        userAId,
        userBId
    );

    // Check existing chat
    const existingChat = await findDirectChat(directKey);

    if (existingChat) {
        return {
            chat: existingChat,
            isNew: false
        };
    }

    // Check whether users exist
    const users = await findUsers([
        userAId,
        userBId
    ]);

    if (users.length !== 2) {
        throw new ApiError(
            404,
            "One or both users do not exist"
        );
    }

    try {

        const chat = await createDirectChat(
            userAId,
            userBId,
            directKey
        );

        return {
            chat,
            isNew: true
        };

    } catch (error) {

        // Handle concurrent requests creating the same chat
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            const chat = await findDirectChat(directKey);

            if (chat) {
                return {
                    chat,
                    isNew: false
                };
            }
        }

        throw error;
    }
};

// Get all chats of a user
export const getUserChats = async (
    userId: string
) => {

    const users = await findUsers([userId]);

    if (users.length === 0) {
        throw new ApiError(404, "User not found");
    }

    return findUserChats(userId);
};

// Check whether a user belongs to a chat
export const isUserChatMember = async (
    chatId: string,
    userId: string
): Promise<boolean> => {

    return isChatMember(chatId, userId);
};