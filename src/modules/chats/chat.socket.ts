
import { Socket, Server } from "socket.io";

import { isUserChatMember } from "./chat.service.js";
import { sendChatMessage } from "./message.service.js";
import {
    markChatMessageRead,
    updateChatLastSeen
} from "./read-receipt.service.js";

import { ApiError } from "../../utils/ApiError.js";

interface JoinChatPayload {
    chatId?: string;
}

interface SendMessagePayload {
    chatId?: string;
    text?: string;
}

interface SocketAck {
    success: boolean;
    message: string;
    data?: unknown;
}

const getChatRoomName = (chatId: string): string => {
    return `chat:${chatId}`;
};

export const registerChatHandlers = (
    io: Server,
    socket: Socket
): void => {

    // Join chat room
    socket.on(
        "chat:join",
        async (
            payload: JoinChatPayload,
            acknowledge?: (response: SocketAck) => void
        ) => {

            try {

                const chatId = payload?.chatId;

                if (
                    typeof chatId !== "string" ||
                    !chatId.trim()
                ) {
                    acknowledge?.({
                        success: false,
                        message: "Valid chat ID is required"
                    });
                    return;
                }

                const userId = socket.data.user.id;

                const isMember = await isUserChatMember(
                    chatId,
                    userId
                );

                if (!isMember) {
                    acknowledge?.({
                        success: false,
                        message: "You are not a member of this chat"
                    });
                    return;
                }

                await socket.join(getChatRoomName(chatId));

                acknowledge?.({
                    success: true,
                    message: "Joined chat successfully",
                    data: { chatId }
                });

            } catch (error) {

                console.error("Chat join error:", error);

                acknowledge?.({
                    success: false,
                    message: "Unable to join chat"
                });
            }
        }
    );

    // Leave chat room
    socket.on(
        "chat:leave",
        async (
            payload: JoinChatPayload,
            acknowledge?: (response: SocketAck) => void
        ) => {

            try {

                const chatId = payload?.chatId;

                if (
                    typeof chatId !== "string" ||
                    !chatId.trim()
                ) {
                    acknowledge?.({
                        success: false,
                        message: "Valid chat ID is required"
                    });
                    return;
                }

                await socket.leave(getChatRoomName(chatId));

                acknowledge?.({
                    success: true,
                    message: "Left chat successfully",
                    data: { chatId }
                });

            } catch (error) {

                console.error("Chat leave error:", error);

                acknowledge?.({
                    success: false,
                    message: "Unable to leave chat"
                });
            }
        }
    );

    // Send message
    socket.on(
        "message:send",
        async (
            payload: SendMessagePayload,
            acknowledge?: (response: SocketAck) => void
        ) => {

            try {

                const { chatId, text } = payload ?? {};

                if (
                    typeof chatId !== "string" ||
                    !chatId.trim()
                ) {
                    acknowledge?.({
                        success: false,
                        message: "Valid chat ID is required"
                    });
                    return;
                }

                if (
                    typeof text !== "string" ||
                    !text.trim() ||
                    text.trim().length > 5000
                ) {
                    acknowledge?.({
                        success: false,
                        message: "Message must contain 1 to 5000 characters"
                    });
                    return;
                }

                const userId = socket.data.user.id;

                // Require the socket to have joined this chat room
                const roomName = getChatRoomName(chatId);

                if (!socket.rooms.has(roomName)) {
                    acknowledge?.({
                        success: false,
                        message: "Join the chat before sending messages"
                    });
                    return;
                }

                // Save message using existing service
                const savedMessage = await sendChatMessage(
                    chatId,
                    userId,
                    text.trim()
                );

                // Broadcast only after successful persistence
                socket.to(roomName).emit(
                    "message:receive",
                    savedMessage
                );

                // Acknowledge sender
                acknowledge?.({
                    success: true,
                    message: "Message sent successfully",
                    data: savedMessage
                });

            } catch (error) {

                console.error("Message send error:", error);

                acknowledge?.({
                    success: false,
                    message: error instanceof Error
                        ? error.message
                        : "Unable to send message"
                });
            }
        }
    );

        // Mark message as read
    socket.on(
        "message:read",
        async (
            payload: {
                chatId?: string;
                messageId?: string;
            },
            acknowledge?: (response: SocketAck) => void
        ) => {

            try {

                const { chatId, messageId } = payload ?? {};

                if (
                    typeof chatId !== "string" ||
                    !chatId.trim() ||
                    typeof messageId !== "string" ||
                    !messageId.trim()
                ) {
                    acknowledge?.({
                        success: false,
                        message: "Valid chat ID and message ID are required"
                    });
                    return;
                }

                const roomName = getChatRoomName(chatId);

                if (!socket.rooms.has(roomName)) {
                    acknowledge?.({
                        success: false,
                        message: "Join the chat before marking messages as read"
                    });
                    return;
                }

                const userId = socket.data.user.id;

                const receipt = await markChatMessageRead(
                    chatId,
                    messageId,
                    userId
                );

                // Notify other participants
                socket.to(roomName).emit(
                    "message:read:receive",
                    receipt
                );

                acknowledge?.({
                    success: true,
                    message: "Message marked as read successfully",
                    data: receipt
                });

            } catch (error) {

                console.error("Read receipt error:", error);

                acknowledge?.({
                    success: false,
                    message: error instanceof ApiError
                        ? error.message
                        : "An unexpected error occurred"
                });
            }
        }
    );

    // Update last seen
    socket.on(
        "chat:lastseen",
        async (
            payload: {
                chatId?: string;
                messageId?: string;
            },
            acknowledge?: (response: SocketAck) => void
        ) => {

            try {

                const { chatId, messageId } = payload ?? {};

                if (
                    typeof chatId !== "string" ||
                    !chatId.trim() ||
                    typeof messageId !== "string" ||
                    !messageId.trim()
                ) {
                    acknowledge?.({
                        success: false,
                        message: "Valid chat ID and message ID are required"
                    });
                    return;
                }

                const roomName = getChatRoomName(chatId);

                if (!socket.rooms.has(roomName)) {
                    acknowledge?.({
                        success: false,
                        message: "Join the chat before updating last seen"
                    });
                    return;
                }

                const userId = socket.data.user.id;

                const lastSeen = await updateChatLastSeen(
                    chatId,
                    messageId,
                    userId
                );

                // Notify other participants
                socket.to(roomName).emit(
                    "chat:lastseen:receive",
                    lastSeen
                );

                acknowledge?.({
                    success: true,
                    message: "Last seen updated successfully",
                    data: lastSeen
                });

            } catch (error) {

                console.error("Last seen error:", error);

                acknowledge?.({
                    success: false,
                    message: error instanceof ApiError
                        ? error.message
                        : "An unexpected error occurred"
                });
            }
        }
    );
};
