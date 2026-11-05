import {
    Request,
    Response,
    NextFunction
} from "express";

import jwt, {
    JwtPayload
} from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

import { AuthUser } from "../modules/auth/auth.types.js";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Access token required");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Invalid access token");
        }

        const decoded = jwt.verify(
            token,
            env.JWT_SECRET
        );

        if (
            typeof decoded === "string" ||
            !decoded.sub ||
            typeof decoded.sub !== "string" ||
            !decoded.email ||
            typeof decoded.email !== "string"
        ) {
            throw new ApiError(401, "Invalid access token");
        }

        const payload = decoded as JwtPayload;

        req.user = {
            id: payload.sub as string,
            name: "",
            email: payload.email as string
        };

        next();

    } catch (error) {

        if (error instanceof ApiError) {
            next(error);
            return;
        }

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError
        ) {
            next(new ApiError(401, "Invalid or expired token"));
            return;
        }

        next(error);
    }
};