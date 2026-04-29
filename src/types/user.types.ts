// ── Matches the Mongoose UserSchema exactly ──────────────────────────────
export interface UserRegistrationForm {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    pinCode?: string;
    profilePhoto?: string;
}

// Backend response: POST /users/register
export interface RegisterResponse {
    message: string;
    user: UserProfile;
}

// Backend response: GET /users/:id  |  PUT /users/:id
export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    pinCode?: string;
    profilePhoto?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// PUT /users/:id — only the allowed update fields
export type UserUpdateForm = Partial<
    Omit<UserRegistrationForm, "password">
>;

// Backend error shape
export interface BackendError {
    message: string;
    error?: string;
}
