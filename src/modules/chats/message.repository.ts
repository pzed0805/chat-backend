import {
    FieldValue,
    Timestamp
} from "firebase-admin/firestore";

import { firestore } from "../../config/firebase.js";

const getMessagesCollection = (chatId: string) => {
    return firestore
        .collection("chats")
        .doc(chatId)
        .collection("messages");
};

// Send message
export const createMessage = async (
    chatId: string,
    senderId: string,
    text: string
) => {

    const messageRef = getMessagesCollection(chatId).doc();

    await messageRef.set({
        senderId,
        text,
        createdAt: FieldValue.serverTimestamp(),
        editedAt: null,
        isDeleted: false
    });

    const snapshot = await messageRef.get();

    const data = snapshot.data();

    if (!data) {
        throw new Error("Message could not be retrieved after creation");
    }

    return {
        id: snapshot.id,
        chatId,
        senderId: data.senderId as string,
        text: data.text as string,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        editedAt: null,
        isDeleted: false
    };
};

// Get messages with cursor pagination
export const getMessages = async (
    chatId: string,
    limit: number,
    cursor?: string
) => {

    const collection = getMessagesCollection(chatId);

    let query = collection
        .orderBy("createdAt", "desc")
        .limit(limit + 1);

    // Apply pagination cursor
    if (cursor) {

        const cursorSnapshot = await collection
            .doc(cursor)
            .get();

        if (!cursorSnapshot.exists) {
            throw new Error("Invalid message cursor");
        }

        query = query.startAfter(cursorSnapshot);
    }

    const snapshot = await query.get();

    const hasMore = snapshot.docs.length > limit;

    // Fetch only the requested number of messages
    const selectedDocs = snapshot.docs.slice(0, limit);

    // Cursor for the next page is the oldest selected document
    const nextCursor = hasMore
        ? selectedDocs[selectedDocs.length - 1].id
        : null;

    // Return chronological order (oldest first)
    const messages = selectedDocs
        .reverse()
        .map(doc => {

            const data = doc.data();

            return {
                id: doc.id,
                chatId,
                senderId: data.senderId as string,
                text: data.text as string,
                createdAt: (data.createdAt as Timestamp)
                    .toDate()
                    .toISOString(),
                editedAt: data.editedAt instanceof Timestamp
                    ? data.editedAt.toDate().toISOString()
                    : null,
                isDeleted: data.isDeleted === true
            };
        });

    return {
        messages,
        pagination: {
            limit,
            hasMore,
            nextCursor
        }
    };
};