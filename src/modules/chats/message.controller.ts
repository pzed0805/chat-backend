import {
    Request,
    Response
} from "express";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
    sendMessageSchema,
    getMessagesSchema
} from "./chat.validation.js";

import {
    sendChatMessage,
    fetchChatMessages
} from "./message.service.js";

// POST /chat/:chatId/message/send
export const sendMessage = async (
    req: Request,
    res: Response
): Promise<void> => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const chatId = req.params.chatId;

    if (typeof chatId !== "string" || !chatId.trim()) {
        throw new ApiError(400, "Invalid chat ID");
    }

    const validation = sendMessageSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(400, "Invalid message data");
    }

    const message = await sendChatMessage(
        chatId,
        req.user.id,
        validation.data.text
    );

    res.status(201).json(
        new ApiResponse(
            "Message sent successfully",
            message
        )
    );
};

// GET /chat/:chatId/messages
export const listMessages = async (
    req: Request,
    res: Response
): Promise<void> => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const chatId = req.params.chatId;

    if (typeof chatId !== "string" || !chatId.trim()) {
        throw new ApiError(400, "Invalid chat ID");
    }

    const validation = getMessagesSchema.safeParse(
        req.query
    );

    if (!validation.success) {
        throw new ApiError(400, "Invalid pagination parameters");
    }

    const result = await fetchChatMessages(
        chatId,
        req.user.id,
        validation.data.limit,
        validation.data.cursor
    );

    res.status(200).json(
        new ApiResponse(
            "Messages fetched successfully",
            result
        )
    );
};