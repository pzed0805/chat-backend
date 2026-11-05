import {
    Request,
    Response
} from "express";

import {
    createOrGetChat,
    getUserChats
} from "./chat.service.js";

import {
    createChatSchema
} from "./chat.validation.js";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Create or get chat
export const createChat = async (
    req: Request,
    res: Response
): Promise<void> => {

    const validation = createChatSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(
            400,
            "Invalid chat creation data"
        );
    }

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const result = await createOrGetChat(
        validation.data,
        req.user.id
    );

    res.status(result.isNew ? 201 : 200).json(
        new ApiResponse(
            result.isNew
                ? "Chat created successfully"
                : "Existing chat retrieved successfully",
            result
        )
    );
};

// Get user's chats
export const listUserChats = async (
    req: Request,
    res: Response
): Promise<void> => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const { userId } = req.params;

    if (userId !== req.user.id) {
        throw new ApiError(
            403,
            "You can only view your own chats"
        );
    }

    const chats = await getUserChats(userId);

    res.status(200).json(
        new ApiResponse(
            "Chats fetched successfully",
            chats
        )
    );
};