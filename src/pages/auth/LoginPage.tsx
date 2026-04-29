import React, { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LoginForm, Role } from "../../types/authTypes";
import { validateLogin, type LoginErrors } from "./validation/authValidation";
import { loginUser } from "../../services/authService";

// ── Reusable Input Field (matched with UserRegistration) ───────────
interface InputFieldProps {
    id: string;
    label: string;
    name: string;
    value: string;
    error?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    id, label, name, value, error, type = "text",
    placeholder, required, onChange,
}) => {
    const cls = [
        "w-full px-4 py-3 rounded-xl border text-sm font-medium text-[#2d2d2d]",
        "placeholder:text-gray-300 bg-white outline-none transition-all duration-200",
        error
            ? "border-red-400 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-[#4C5040] focus:ring-2 focus:ring-[#4C5040]/10",
    ].join(" ");

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase flex items-center gap-1"
            >
                {label}
                {required && <span className="text-[#4C5040]">*</span>}
            </label>

            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="off"
                className={cls}
            />

            {error && (
                <p className="text-red-500 text-xs font-medium leading-tight">{error}</p>
            )}
        </div>
    );
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<Role>("vendor");
    const [loading, setLoading] = useState(false);

    // Check if user or vendor is already logged in and redirect them
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const vendorId = localStorage.getItem("vendorId");

        if (userId) {
            navigate("/");
        } else if (vendorId) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const [form, setForm] = useState<LoginForm>({
        email: "",
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<LoginErrors>({});

    const handleRoleChange = (newRole: Role) => {
        setRole(newRole);
        setErrors({});
        setForm({
            email: "",
            username: "",
            password: "",
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = validateLogin(role, form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(role, form);

            if ("user" in data) {
                localStorage.setItem("userId", data.user._id);
                toast.success("Login Success 🚀");
                setTimeout(() => navigate("/"), 1000);
            } else {
                localStorage.setItem("vendorId", data.vendor._id);
                toast.success("Login Success 🚀");
                setTimeout(() => navigate("/dashboard"), 1000);
            }
        } catch {
            toast.error("Login Failed ❌");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F6F2] font-sans">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#fff",
                        color: "#2d2d2d",
                        borderRadius: "1rem",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                    },
                }}
            />

            {/* ── Navbar ─────────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-gray-200">
                <Link
                    to="/"
                    className="text-2xl font-serif italic tracking-wide text-[#2d2d2d] hover:text-[#4C5040] transition-colors"
                >
                    Book My Venue.
                </Link>
                <div className="flex gap-4 text-sm text-gray-500 hidden sm:flex items-center">
                    <p>New here?</p>
                    <Link
                        to="/user-register"
                        className="px-4 py-2 rounded-xl border border-gray-200 text-[#2d2d2d] font-semibold hover:bg-white hover:border-gray-300 transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>
            </header>

            {/* ── Page body ──────────────────────────────────────────────── */}
            <div className="flex flex-col justify-center items-center min-h-screen px-4 pt-28 pb-16">
                
                {/* Heading Section */}
                <div className="w-full max-w-md mb-8 text-center sm:text-left">
                    <h1 className="text-4xl sm:text-5xl font-serif text-[#2d2d2d] leading-tight mb-2">
                        Welcome Back 👋
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Please enter your details to sign in
                    </p>
                </div>

                {/* Card */}
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden p-6 sm:p-8">
                    
                    {/* Role Toggle */}
                    <div className="flex bg-[#F7F6F2] rounded-2xl p-1 mb-8 border border-gray-100">
                        <button
                            type="button"
                            onClick={() => handleRoleChange("vendor")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${role === "vendor"
                                ? "bg-white shadow-sm text-[#4C5040]"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Vendor
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange("user")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${role === "user"
                                ? "bg-white shadow-sm text-[#4C5040]"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            User
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email or Username */}
                        {role === "user" ? (
                            <InputField
                                id="login-email"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={form.email || ""}
                                error={errors.email}
                                placeholder="you@example.com"
                                onChange={handleChange}
                                required
                            />
                        ) : (
                            <InputField
                                id="login-username"
                                label="Username"
                                name="username"
                                type="text"
                                value={form.username || ""}
                                error={errors.username}
                                placeholder="vendor_username"
                                onChange={handleChange}
                                required
                            />
                        )}

                        {/* Password */}
                        <InputField
                            id="login-password"
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            error={errors.password}
                            placeholder="Enter your password"
                            onChange={handleChange}
                            required
                        />

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={[
                                "w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl text-sm font-semibold",
                                "tracking-wide transition-all duration-200 active:scale-[0.98] shadow-sm",
                                loading
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-[#4C5040] text-[#F7F6F2] hover:bg-[#3c4032]",
                            ].join(" ") || undefined}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 text-center text-sm text-gray-500">
                        <p>
                            Don't have an account?{" "}
                            <Link to="/user-register" className="text-[#4C5040] font-semibold hover:underline">
                                Register as User
                            </Link>
                        </p>
                        <p>
                            Are you a venue owner?{" "}
                            <Link to="/register" className="text-[#4C5040] font-semibold hover:underline">
                                Register as Vendor
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;