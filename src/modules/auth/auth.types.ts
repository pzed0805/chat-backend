export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}