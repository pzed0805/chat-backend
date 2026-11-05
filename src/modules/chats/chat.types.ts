export interface CreateChatInput {
    userAId: string;
    userBId: string;
}

export interface ChatMemberResponse {
    userId: string;
    name: string;
    email: string;
}

export interface ChatResponse {
    id: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    members: ChatMemberResponse[];
}
export interface SendMessageInput {
    chatId: string;
    text: string;
    senderId: string;
}

export interface MessageResponse {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: string;
    editedAt: string | null;
    isDeleted: boolean;
}

export interface GetMessagesResponse {
    messages: MessageResponse[];
    pagination: {
        limit: number;
        hasMore: boolean;
        nextCursor: string | null;
    };
}

export interface MarkMessageReadInput {
    chatId: string;
    messageId: string;
    userId: string;
}

export interface ReadReceiptResponse {
    messageId: string;
    userId: string;
    readAt: string;
}

export interface UpdateLastSeenInput {
    chatId: string;
    messageId: string;
    userId: string;
}

export interface LastSeenResponse {
    userId: string;
    lastSeenMessageId: string;
    lastSeenAt: string;
}