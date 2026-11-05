import { Router } from "express";

import {
    createChat,
    listUserChats
} from "./chat.controller.js";

import {
    sendMessage,
    listMessages
} from "./message.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

import {
    markRead,
    updateLastSeen
} from "./read-receipt.controller.js";

const router = Router();

// All chat APIs require JWT authentication
router.use(authenticate);

// Chat management
router.post("/chat/create", createChat);

router.get("/user/:userId/chats", listUserChats);

// Messaging
router.post(
    "/chat/:chatId/message/send",
    sendMessage
);

router.get(
    "/chat/:chatId/messages",
    listMessages
);


// Read receipts
router.post(
    "/chat/:chatId/message/:messageId/read",
    markRead
);

// Last seen
router.post(
    "/chat/:chatId/lastseen",
    updateLastSeen
);
export default router;