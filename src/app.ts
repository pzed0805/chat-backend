import express, {
    Application,
    Request,
    Response
} from "express";

import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

import chatRoutes from "./modules/chats/chat.routes.js";

const app: Application = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// Health check
app.get(
    "/health",
    (_req: Request, res: Response) => {

        res.status(200).json({
            success: true,
            message: "Chat backend is running"
        });
    }
);

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use(errorMiddleware);

export default app;