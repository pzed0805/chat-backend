import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";

import { ChatType } from "../../generated/prisma/enums.js";

const chatInclude = {
    members: {
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    }
} satisfies Prisma.ChatInclude;

// Find an existing direct chat
export const findDirectChat = async (
    directKey: string
) => {
    return prisma.chat.findUnique({
        where: {
            directKey
        },
        include: chatInclude
    });
};

// Check whether both users exist
export const findUsers = async (
    userIds: string[]
) => {
    return prisma.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });
};

// Create a direct chat and its members atomically
export const createDirectChat = async (
    userAId: string,
    userBId: string,
    directKey: string
) => {
    return prisma.$transaction(async (tx) => {

        const chat = await tx.chat.create({
            data: {
                type: ChatType.DIRECT,
                directKey,
                members: {
                    create: [
                        { userId: userAId },
                        { userId: userBId }
                    ]
                }
            },
            include: chatInclude
        });

        return chat;
    });
};

// List all chats belonging to a user
export const findUserChats = async (
    userId: string
) => {
    return prisma.chat.findMany({
        where: {
            members: {
                some: {
                    userId
                }
            }
        },
        include: chatInclude,
        orderBy: {
            updatedAt: "desc"
        }
    });
};


// Check whether a user belongs to a chat
export const isChatMember = async (
    chatId: string,
    userId: string
): Promise<boolean> => {

    const membership = await prisma.chatMember.findUnique({
        where: {
            chatId_userId: {
                chatId,
                userId
            }
        },
        select: {
            id: true
        }
    });

    return membership !== null;
};
