import {
    Request,
    Response
} from "express";

import {
    registerUser,
    loginUser,
    getCurrentUser
} from "./auth.service.js";

import {
    registerSchema,
    loginSchema
} from "./auth.validation.js";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const register = async (
    req: Request,
    res: Response
): Promise<void> => {

    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(400, "Invalid registration data");
    }

    const result = await registerUser(validation.data);

    res.status(201).json(
        new ApiResponse(
            "User registered successfully",
            result
        )
    );
};

export const login = async (
    req: Request,
    res: Response
): Promise<void> => {

    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        throw new ApiError(400, "Invalid login data");
    }

    const result = await loginUser(validation.data);

    res.status(200).json(
        new ApiResponse(
            "Login successful",
            result
        )
    );
};

export const me = async (
    req: Request,
    res: Response
): Promise<void> => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await getCurrentUser(req.user.id);

    res.status(200).json(
        new ApiResponse(
            "User fetched successfully",
            user
        )
    );
};