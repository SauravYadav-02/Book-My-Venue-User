import axios from "axios";
import type { LoginForm, LoginResponse, Role } from "../types/authTypes";


export const loginUser = async (
    role: Role,
    form: LoginForm
): Promise<LoginResponse> => {
    const url =
        role === "user"
            ? "http://localhost:3000/users/login"
            : "http://localhost:3000/vendors/login";

    try {
        const res = await axios.post<LoginResponse>(url, form);
        return res.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error("Login Error: ", error?.response?.data || error.message);
        } else {
            console.error("Unexpected Error: ", error);
        }
        throw error;
    }
};