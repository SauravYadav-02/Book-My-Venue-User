export type Role = "user" | "vendor";

export interface LoginForm {
    email?: string;
    username?: string;
    password: string;
}

export interface UserResponse {
    user: { _id: string };
}

export interface VendorResponse {
    vendor: { _id: string };
}

export type LoginResponse = UserResponse | VendorResponse;