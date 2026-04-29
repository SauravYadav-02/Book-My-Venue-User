import type { LoginForm, Role } from "../../../types/authTypes";

export interface LoginErrors {
    email?: string;
    username?: string;
    password?: string;
}

export const validateLogin = (role: Role, form: LoginForm): LoginErrors => {
    const errors: LoginErrors = {};

    if (role === "user") {
        const emailRe = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!form.email || !form.email.trim()) {
            errors.email = "Email is required.";
        } else if (!emailRe.test(form.email)) {
            errors.email = "Please enter a valid email address.";
        }
    } else {
        if (!form.username || !form.username.trim()) {
            errors.username = "Username is required.";
        }
    }

    if (!form.password || !form.password.trim()) {
        errors.password = "Password is required.";
    } else if (form.password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
    }

    return errors;
};