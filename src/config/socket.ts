
import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { registerChatHandlers } from "../modules/chats/chat.socket.js";

import { env } from "./env.js";

export interface SocketUser {
    id: string;
    email: string;
}

declare module "socket.io" {
    interface SocketData {
        user: SocketUser;
    }
}

export const initializeSocket = (httpServer: HttpServer): Server => {

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Authenticate every incoming Socket.IO connection
    io.use((socket, next) => {

        try {

            const token = socket.handshake.auth?.token;

            if (typeof token !== "string" || !token) {
                return next(new Error("Access token required"));
            }

            // Allow either a raw JWT or "Bearer <JWT>"
            const accessToken = token.startsWith("Bearer ")
                ? token.slice(7)
                : token;

            const decoded = jwt.verify(
                accessToken,
                env.JWT_SECRET
            );

            if (
                typeof decoded === "string" ||
                typeof decoded.sub !== "string" ||
                typeof decoded.email !== "string"
            ) {
                return next(new Error("Invalid access token"));
            }

            const payload = decoded as JwtPayload;

            socket.data.user = {
                id: payload.sub as string,
                email: payload.email as string
            };

            next();

        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

io.on("connection", (socket) => {

    console.log(
        `Socket connected: ${socket.data.user.id}`
    );

    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {

        console.log(
            `Socket disconnected: ${socket.data.user.id}`,
            reason
        );

    });

});

    return io;
};
