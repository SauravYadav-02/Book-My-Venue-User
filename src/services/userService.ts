import axios from "axios";
import type {
    UserRegistrationForm,
    RegisterResponse,
    UserProfile,
    UserUpdateForm,
} from "../types/user.types";

const BASE_URL = "http://localhost:3000/users";

// ── Helper: extract a readable message from axios errors ─────────────────
const extractMessage = (error: unknown, fallback: string): never => {
    if (axios.isAxiosError(error)) {
        const msg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message;
        throw new Error(msg || fallback);
    }
    throw new Error(fallback);
};

// ── POST /users/register ─────────────────────────────────────────────────
// Body : { name, email, password, phone?, address?, city?, pinCode?, profilePhoto? }
// 201  : { message: "User registered", user: UserProfile }
// 400  : { message: "Registration failed", error: "..." }
export const registerUser = async (
    data: UserRegistrationForm | FormData
): Promise<RegisterResponse> => {
    try {
        const res = await axios.post<RegisterResponse>(`${BASE_URL}/register`, data);
        return res.data;
    } catch (error) {
        return extractMessage(error, "Registration failed. Please try again.");
    }
};

// ── GET /users/:id ───────────────────────────────────────────────────────
// 200  : UserProfile  (password excluded by server)
// 404  : { message: "User not found" }
export const getUserById = async (id: string): Promise<UserProfile> => {
    try {
        const res = await axios.get<UserProfile>(`${BASE_URL}/${id}`);
        return res.data;
    } catch (error) {
        return extractMessage(error, "Failed to retrieve user profile.");
    }
};

// ── PUT /users/:id ───────────────────────────────────────────────────────
// Allowed fields: name, email, phone, address, city, pinCode, profilePhoto
// 200  : { message: "User updated", user: UserProfile }
// 400  : { message: "No valid fields provided for update" }
// 404  : { message: "User not found" }
export const updateUser = async (
    id: string,
    data: UserUpdateForm
): Promise<{ message: string; user: UserProfile }> => {
    try {
        const res = await axios.put<{ message: string; user: UserProfile }>(
            `${BASE_URL}/${id}`,
            data
        );
        return res.data;
    } catch (error) {
        return extractMessage(error, "Failed to update user.");
    }
};
