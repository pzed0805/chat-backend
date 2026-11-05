import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";

import { ApiError } from "../../utils/ApiError.js";

import {
    RegisterInput,
    LoginInput,
    AuthResponse,
    AuthUser
} from "./auth.types.js";

const SALT_ROUNDS = 12;

// Generate JWT
const generateToken = (user: AuthUser): string => {

    return jwt.sign(
        {
            sub: user.id,
            email: user.email
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
        }
    );
};

// Register user
export const registerUser = async (
    input: RegisterInput
): Promise<AuthResponse> => {

    const { name, email, password } = input;

    // Check existing user
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw new ApiError(409, "Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
        password,
        SALT_ROUNDS
    );

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    const safeUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    const token = generateToken(safeUser);

    return {
        user: safeUser,
        token
    };
};

// Login user
export const loginUser = async (
    input: LoginInput
): Promise<AuthResponse> => {

    const { email, password } = input;

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const safeUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    const token = generateToken(safeUser);

    return {
        user: safeUser,
        token
    };
};

// Get current user
export const getCurrentUser = async (
    userId: string
): Promise<AuthUser> => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};