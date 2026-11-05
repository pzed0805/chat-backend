
import "dotenv/config";

import { createServer } from "node:http";

import app from "./app.js";

import { env } from "./config/env.js";

import {
    connectDatabase,
    prisma
} from "./config/database.js";

import { firestore } from "./config/firebase.js";

import { initializeSocket } from "./config/socket.js";

const startServer = async (): Promise<void> => {

    try {

        // Connect PostgreSQL
        await connectDatabase();

        // Initialize/check Firestore
        await firestore.listCollections();

        console.log("Firestore connected successfully");

        // Create HTTP server using Express
        const httpServer = createServer(app);

        // Initialize Socket.IO
        const io = initializeSocket(httpServer);

        // Start HTTP + Socket.IO server
        httpServer.listen(env.PORT, () => {

            console.log(
                `Server running at http://localhost:${env.PORT}`
            );

            console.log(`Environment: ${env.NODE_ENV}`);
            console.log("Socket.IO server initialized successfully");
        });

        const shutdown = async (): Promise<void> => {

            console.log("Shutting down server...");

            // Close Socket.IO connections and HTTP server
            io.close(async () => {

                await prisma.$disconnect();

                console.log("Database disconnected");

                process.exit(0);
            });
        };

        process.on("SIGINT", () => {
            void shutdown();
        });

        process.on("SIGTERM", () => {
            void shutdown();
        });

    } catch (error) {

        console.error("Server startup failed:", error);

        await prisma.$disconnect();

        process.exit(1);
    }
};

void startServer();
