import React, { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail, Lock, Sparkles } from "lucide-react";
import type { LoginForm } from "../../types/authTypes";
import { loginUser } from "../../services/authService";

// ── Reusable Input Field ────────────────────────────────────────────
interface InputFieldProps {
    id: string;
    label: string;
    name: string;
    value: string;
    error?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    icon: React.ElementType;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    id, label, name, value, error, type = "text",
    placeholder, required, icon: Icon, onChange,
}) => (
    <div className="flex flex-col gap-1.5">
        <label
            htmlFor={id}
            className="text-[10px] font-bold tracking-[0.18em] text-stone-400 uppercase flex items-center gap-1"
        >
            {label}
            {required && <span className="text-rose-400">*</span>}
        </label>

        <div className="relative">
            <Icon
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    error ? "text-red-400" : "text-stone-300"
                }`}
            />
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="off"
                className={[
                    "w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-stone-800",
                    "placeholder:text-stone-300 bg-white/80 backdrop-blur-sm outline-none",
                    "transition-all duration-200",
                    error
                        ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        : "border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-400/10 hover:border-stone-300",
                ].join(" ")}
            />
        </div>

        {error && (
            <p className="text-red-500 text-xs font-medium leading-tight pl-1">{error}</p>
        )}
    </div>
);

// ── Main Login Page ─────────────────────────────────────────────────
const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "/";
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) navigate(redirectUrl);
    }, [navigate, redirectUrl]);

    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: { email?: string; password?: string } = {};
        const emailRe = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!form.email?.trim()) {
            newErrors.email = "Email is required.";
        } else if (!emailRe.test(form.email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!form.password?.trim()) {
            newErrors.password = "Password is required.";
        } else if (form.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser("user", form);
            if ("user" in data) {
                localStorage.setItem("userId", data.user._id);
                toast.success("Welcome back! 🎉");
                setTimeout(() => navigate(redirectUrl), 1000);
            }
        } catch {
            toast.error("Login failed. Please check your credentials.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
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

            {/* ── Left Panel: Wedding Image ─────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                {/* Background image */}
                <img
                    src="/wedding_bg.png"
                    alt="Elegant wedding venue"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Overlay content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-serif italic tracking-wide">
                            Book My Venue.
                        </span>
                    </Link>

                    {/* Bottom text */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-sm font-medium">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            India's #1 Venue Booking Platform
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-serif leading-tight">
                            Your perfect venue<br />
                            <span className="text-amber-300">awaits you.</span>
                        </h1>
                        <p className="text-white/70 text-base font-light leading-relaxed max-w-sm">
                            Discover and book stunning wedding halls, banquets, and event spaces for your most cherished moments.
                        </p>

                        {/* Stats row */}
                        <div className="flex gap-8 pt-4 border-t border-white/20">
                            {[
                                { value: "10K+", label: "Venues Listed" },
                                { value: "50K+", label: "Happy Couples" },
                                { value: "200+", label: "Cities" },
                            ].map(({ value, label }) => (
                                <div key={label}>
                                    <p className="text-2xl font-bold text-amber-300">{value}</p>
                                    <p className="text-xs text-white/60 font-medium mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel: Login Form ────────────────────────────────── */}
            <div className="flex-1 flex flex-col justify-center items-center bg-[#FDFCFB] px-6 sm:px-10 py-12 relative">

                {/* Mobile logo */}
                <div className="lg:hidden absolute top-6 left-6">
                    <Link
                        to="/"
                        className="text-xl font-serif italic tracking-wide text-stone-700 hover:text-stone-900 transition-colors"
                    >
                        Book My Venue.
                    </Link>
                </div>

                {/* Mobile header image strip */}
                <div className="lg:hidden w-full max-w-sm mb-8 rounded-2xl overflow-hidden relative h-36">
                    <img
                        src="/wedding_bg.png"
                        alt="Wedding venue"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                        <p className="text-white text-sm font-medium">India's #1 Venue Booking Platform</p>
                    </div>
                </div>

                <div className="w-full max-w-sm">

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 leading-tight mb-2">
                            Welcome Back 👋
                        </h2>
                        <p className="text-stone-400 text-sm">
                            Sign in to discover and book beautiful venues
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">

                        <InputField
                            id="login-email"
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email || ""}
                            error={errors.email}
                            placeholder="you@example.com"
                            onChange={handleChange}
                            icon={Mail}
                            required
                        />

                        <InputField
                            id="login-password"
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            error={errors.password}
                            placeholder="Min. 6 characters"
                            onChange={handleChange}
                            icon={Lock}
                            required
                        />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={[
                                "w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl text-sm font-semibold",
                                "tracking-wide transition-all duration-200 active:scale-[0.98]",
                                loading
                                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                    : "bg-stone-800 text-white hover:bg-stone-900 shadow-lg shadow-stone-800/20 hover:shadow-stone-800/30",
                            ].join(" ")}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={16} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-7">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-xs text-stone-400 font-medium">or</span>
                        <div className="flex-1 h-px bg-stone-200" />
                    </div>

                    {/* Footer links */}
                    <div className="space-y-3 text-sm text-center text-stone-500">
                        <p>
                            Don't have an account?{" "}
                            <Link
                                to={redirectUrl !== "/" ? `/user-register?redirect=${encodeURIComponent(redirectUrl)}` : "/user-register"}
                                className="text-stone-800 font-semibold hover:underline underline-offset-2"
                            >
                                Register as User
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;