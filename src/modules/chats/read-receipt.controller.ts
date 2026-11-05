
import {
    Request,
    Response
} from "express";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
    markMessageReadSchema,
    updateLastSeenSchema
} from "./chat.validation.js";

import {
    markChatMessageRead,
    updateChatLastSeen
} from "./read-receipt.service.js";

// POST /chat/:chatId/message/:messageId/read
export const markRead = async (
    req: Request,
    res: Response
): Promise<void> => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const { chatId, messageId } = req.params;

    if (
        typeof chatId !== "string" ||
        typeof messageId !== "string"
    ) {
        throw new ApiError(400, "Invalid chat or message ID");
    }

    const validation = markMessageReadSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(400, "Invalid read receipt data");
    }

    // Never allow a client to act as another user.
    if (validation.data.userId !== req.user.id) {
        throw new ApiError(403, "You cannot update another user's read receipt");
    }

    const result = await markChatMessageRead(
        chatId,
        messageId,
        req.user.id
    );

    res.status(200).json(
        new ApiResponse(
            "Message marked as read successfully",
            result
        )
    );
};

// POST /chat/:chatId/lastseen
export const updateLastSeen = async (
    req: Request,
    res: Response
): Promise<void> => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const chatId = req.params.chatId;

    if (typeof chatId !== "string") {
        throw new ApiError(400, "Invalid chat ID");
    }

    const validation = updateLastSeenSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(400, "Invalid last seen data");
    }

    if (validation.data.userId !== req.user.id) {
        throw new ApiError(403, "You cannot update another user's last seen");
    }

    const result = await updateChatLastSeen(
        chatId,
        validation.data.messageId,
        req.user.id
    );

    res.status(200).json(
        new ApiResponse(
            "Last seen updated successfully",
            result
        )
    );
};
