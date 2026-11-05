
import {
    FieldValue,
    Timestamp
} from "firebase-admin/firestore";

import { firestore } from "../../config/firebase.js";

// Get message reference
const getMessageRef = (
    chatId: string,
    messageId: string
) => {
    return firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .doc(messageId);
};

// Mark message as read
export const markMessageAsRead = async (
    chatId: string,
    messageId: string,
    userId: string
) => {
    const messageRef = getMessageRef(chatId, messageId);

    const receiptRef = messageRef
        .collection("readReceipts")
        .doc(userId);

    return firestore.runTransaction(async (transaction) => {

        const messageSnapshot = await transaction.get(messageRef);

        if (!messageSnapshot.exists) {
            throw new Error("MESSAGE_NOT_FOUND");
        }

        const message = messageSnapshot.data();

        if (message?.senderId === userId) {
            throw new Error("CANNOT_READ_OWN_MESSAGE");
        }

        const existingReceipt = await transaction.get(receiptRef);

        if (existingReceipt.exists) {
            const existing = existingReceipt.data();

            return {
                messageId,
                userId,
                readAt: (existing?.readAt as Timestamp)
                    .toDate()
                    .toISOString()
            };
        }

        const readAt = FieldValue.serverTimestamp();

        transaction.set(receiptRef, {
            userId,
            messageId,
            readAt
        });

        // Return an application timestamp for the API response.
        // Firestore stores its authoritative server timestamp.
        return {
            messageId,
            userId,
            readAt: new Date().toISOString()
        };
    });
};

// Update last seen message
export const updateLastSeenMessage = async (
    chatId: string,
    messageId: string,
    userId: string
) => {

    const messageRef = getMessageRef(chatId, messageId);

    const lastSeenRef = firestore
        .collection("chats")
        .doc(chatId)
        .collection("lastSeen")
        .doc(userId);

    return firestore.runTransaction(async (transaction) => {

        const messageSnapshot = await transaction.get(messageRef);

        if (!messageSnapshot.exists) {
            throw new Error("MESSAGE_NOT_FOUND");
        }

        const message = messageSnapshot.data();

        const messageCreatedAt = message?.createdAt as Timestamp;

        if (!messageCreatedAt) {
            throw new Error("MESSAGE_TIMESTAMP_NOT_AVAILABLE");
        }

        const lastSeenSnapshot = await transaction.get(lastSeenRef);

        if (lastSeenSnapshot.exists) {

            const existing = lastSeenSnapshot.data();

            const existingTimestamp = existing?.lastSeenAt as Timestamp;

            // Prevent last seen from moving backwards.
            if (
                existingTimestamp &&
                existingTimestamp.toMillis() >= messageCreatedAt.toMillis()
            ) {
                return {
                    userId,
                    lastSeenMessageId: existing?.lastSeenMessageId as string,
                    lastSeenAt: existingTimestamp.toDate().toISOString()
                };
            }
        }

        transaction.set(lastSeenRef, {
            userId,
            lastSeenMessageId: messageId,
            lastSeenAt: messageCreatedAt
        });

        return {
            userId,
            lastSeenMessageId: messageId,
            lastSeenAt: messageCreatedAt.toDate().toISOString()
        };
    });
};
