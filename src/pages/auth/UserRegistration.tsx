import React, {
    useState,
    useRef,
    useCallback,
    type FormEvent,
    type ChangeEvent,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Camera, Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { registerUser } from "../../services/userService";

// ── Form state types ──────────────────────────────────────────────────────────
interface Step1Form {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    city: string;
    address: string;
    pinCode: string;
}

type Step1Errors = Partial<Record<keyof Step1Form, string>>;

interface Step2State {
    file: File | null;
    previewUrl: string | null;
}

// ── Validation (mirrors backend Mongoose rules) ───────────────────────────────
const emailRe = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

function validateStep1(f: Step1Form): Step1Errors {
    const e: Step1Errors = {};

    if (!f.name.trim() || f.name.trim().length < 2 || f.name.trim().length > 50)
        e.name = "Name must be between 2 and 50 characters.";

    if (!f.email || !emailRe.test(f.email))
        e.email = "Please enter a valid email address.";

    if (!f.password || f.password.length < 6)
        e.password = "Password must be at least 6 characters.";

    if (!f.confirmPassword)
        e.confirmPassword = "Please confirm your password.";
    else if (f.password !== f.confirmPassword)
        e.confirmPassword = "Passwords do not match.";

    if (f.phone && !/^\d{10}$/.test(f.phone))
        e.phone = "Must be a valid 10-digit number.";

    if (f.city && f.city.trim().length > 50)
        e.city = "City cannot exceed 50 characters.";

    if (f.address && f.address.trim().length > 200)
        e.address = "Address cannot exceed 200 characters.";

    if (f.pinCode && !/^\d{6}$/.test(f.pinCode))
        e.pinCode = "Must be a valid 6-digit pin code.";

    return e;
}

// ── Reusable Input Field ──────────────────────────────────────────────────────
interface InputFieldProps {
    id: string;
    label: string;
    name: keyof Step1Form;
    value: string;
    error?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    textarea?: boolean;
    rows?: number;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    id, label, name, value, error, type = "text",
    placeholder, required, textarea, rows = 2, onChange,
}) => {
    const cls = [
        "w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-[#2d2d2d]",
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

            {textarea ? (
                <textarea
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    className={cls + " resize-none"}
                />
            ) : (
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
            )}

            {error && (
                <p className="text-red-500 text-xs font-medium leading-tight">{error}</p>
            )}
        </div>
    );
};

// ── Step Indicator ────────────────────────────────────────────────────────────
const STEPS = ["User Details", "Profile Photo"] as const;

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((label, idx) => {
            const stepNum = idx + 1;
            const done = current > stepNum;
            const active = current === stepNum;

            return (
                <React.Fragment key={stepNum}>
                    <div className="flex items-center gap-2.5">
                        {/* Circle */}
                        <div
                            className={[
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                "transition-all duration-300",
                                done || active
                                    ? "bg-[#4C5040] text-[#F7F6F2]"
                                    : "bg-gray-100 text-gray-400",
                                active ? "ring-4 ring-[#4C5040]/15 scale-110" : "",
                            ].join(" ")}
                        >
                            {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : stepNum}
                        </div>

                        {/* Label */}
                        <span
                            className={[
                                "text-xs font-semibold hidden sm:block transition-colors duration-200",
                                active || done ? "text-[#4C5040]" : "text-gray-400",
                            ].join(" ")}
                        >
                            {label}
                        </span>
                    </div>

                    {/* Connector */}
                    {idx < STEPS.length - 1 && (
                        <div className="flex-1 max-w-[56px] h-0.5 rounded-full transition-all duration-500 bg-gray-200 overflow-hidden">
                            <div
                                className="h-full bg-[#4C5040] transition-all duration-500"
                                style={{ width: done ? "100%" : "0%" }}
                            />
                        </div>
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserRegistration: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [stepKey, setStepKey] = useState(0); // triggers re-mount for animation

    // Step 1 state
    const [form, setForm] = useState<Step1Form>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        city: "",
        address: "",
        pinCode: "",
    });
    const [errors, setErrors] = useState<Step1Errors>({});

    // Step 2 state
    const [photo, setPhoto] = useState<Step2State>({ file: null, previewUrl: null });

    // ── Field change with real-time single-field validation ─────────────────
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            const key = name as keyof Step1Form;
            const updated = { ...form, [key]: value };
            setForm(updated);

            // Validate only the touched field
            const allErrors = validateStep1(updated);
            setErrors((prev) => ({
                ...prev,
                [key]: allErrors[key] ?? "",
            }));
        },
        [form]
    );

    // ── Step 1 → Step 2 ─────────────────────────────────────────────────────
    const handleNext = () => {
        const errs = validateStep1(form);
        setErrors(errs);
        if (Object.keys(errs).filter((k) => errs[k as keyof Step1Errors]).length === 0) {
            setStep(2);
            setStepKey((k) => k + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        setStep(1);
        setStepKey((k) => k + 1);
    };

    // ── Photo upload ─────────────────────────────────────────────────────────
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
        setPhoto({ file, previewUrl: URL.createObjectURL(file) });
    };

    // ── Final submit ─────────────────────────────────────────────────────────
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();

            // Append all form fields except confirmPassword
            Object.entries(form).forEach(([key, value]) => {
                if (key !== "confirmPassword" && value !== undefined && value !== "") {
                    formData.append(key, value);
                }
            });

            // Append the profile photo if it exists
            if (photo.file) {
                console.log("APPENDING PHOTO:", photo.file.name, photo.file.type);
                formData.append("profilePhoto", photo.file);
            } else {
                console.log("NO PHOTO SELECTED!");
            }

            // Log what we are sending
            // for (let [key, val] of formData.entries()) {
            //     console.log("FormData Entry:", key, val instanceof File ? `File: ${val.name}` : val);
            // }

            await registerUser(formData);
            toast.success("Account created! Redirecting to login… 🎉");
            setTimeout(() => navigate("/login"), 1600);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    // Check if Step 1 is pristinely valid (for button state hint)
    const step1HasErrors =
        Object.values(errors).some(Boolean) ||
        !form.name || !form.email || !form.password || !form.confirmPassword;

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
                <p className="text-sm text-gray-500 hidden sm:block">
                    Have an account?{" "}
                    <Link
                        to="/login"
                        className="text-[#4C5040] font-semibold hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </header>

            {/* ── Page body ──────────────────────────────────────────────── */}
            <div className="flex justify-center min-h-screen px-4 pt-28 pb-16">
                <div className="w-full max-w-2xl">

                    {/* Page heading */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-serif text-[#2d2d2d] leading-tight mb-2">
                            Create your account
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Join to discover and book the best venues for your events
                        </p>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator current={step} />

                    {/* ── Card ────────────────────────────────────────────── */}
                    <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">

                        {/* ── STEP 1: User Details ──────────────────────── */}
                        {step === 1 && (
                            <div key={stepKey} className="p-8 sm:p-10 animate-step-in">
                                <div className="mb-7">
                                    <h2 className="text-xl font-semibold text-[#4C5040]">
                                        Your Details
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Fields marked{" "}
                                        <span className="text-[#4C5040] font-bold">*</span>{" "}
                                        are required.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                    {/* Full Name — full width */}
                                    <div className="sm:col-span-2">
                                        <InputField
                                            id="reg-name"
                                            label="Full Name"
                                            name="name"
                                            value={form.name}
                                            error={errors.name}
                                            placeholder="Priya Sharma"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Email — full width */}
                                    <div className="sm:col-span-2">
                                        <InputField
                                            id="reg-email"
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            error={errors.email}
                                            placeholder="priya@example.com"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Password */}
                                    <InputField
                                        id="reg-password"
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        error={errors.password}
                                        placeholder="Min. 6 characters"
                                        required
                                        onChange={handleChange}
                                    />

                                    {/* Confirm Password */}
                                    <InputField
                                        id="reg-confirm"
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={form.confirmPassword}
                                        error={errors.confirmPassword}
                                        placeholder="Re-enter password"
                                        required
                                        onChange={handleChange}
                                    />

                                    {/* ── Optional divider ─────────────── */}
                                    <div className="sm:col-span-2 flex items-center gap-4 py-1">
                                        <div className="flex-1 h-px bg-gray-100" />
                                        <span className="text-[10px] tracking-widest text-gray-400 uppercase font-bold shrink-0">
                                            Optional
                                        </span>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>

                                    {/* Phone */}
                                    <InputField
                                        id="reg-phone"
                                        label="Phone Number"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        error={errors.phone}
                                        placeholder="10-digit number"
                                        onChange={handleChange}
                                    />

                                    {/* City */}
                                    <InputField
                                        id="reg-city"
                                        label="City"
                                        name="city"
                                        value={form.city}
                                        error={errors.city}
                                        placeholder="Mumbai"
                                        onChange={handleChange}
                                    />

                                    {/* Address — full width */}
                                    <div className="sm:col-span-2">
                                        <InputField
                                            id="reg-address"
                                            label="Address"
                                            name="address"
                                            value={form.address}
                                            error={errors.address}
                                            placeholder="Street, apartment, area…"
                                            textarea
                                            rows={2}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Pin Code */}
                                    <InputField
                                        id="reg-pincode"
                                        label="Pin Code"
                                        name="pinCode"
                                        value={form.pinCode}
                                        error={errors.pinCode}
                                        placeholder="6-digit pin"
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Next button */}
                                <div className="flex justify-end mt-8">
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={step1HasErrors}
                                        title={step1HasErrors ? "Complete required fields to continue" : ""}
                                        className={[
                                            "flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold",
                                            "tracking-wide transition-all duration-200 active:scale-[0.98] shadow-sm",
                                            step1HasErrors
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-[#4C5040] text-[#F7F6F2] hover:bg-[#3c4032]",
                                        ].join(" ")}
                                    >
                                        Continue
                                        <ArrowRight size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Profile Photo ─────────────────────── */}
                        {step === 2 && (
                            <form
                                key={stepKey}
                                onSubmit={handleSubmit}
                                className="p-8 sm:p-10 animate-step-in"
                            >
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-[#4C5040]">
                                        Profile Photo
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Upload a profile photo — this step is optional.
                                    </p>
                                </div>

                                {/* Upload area */}
                                <div className="flex flex-col items-center gap-5 py-4">

                                    {/* Avatar circle */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={[
                                            "relative w-40 h-40 rounded-full overflow-hidden",
                                            "border-2 border-dashed transition-all duration-200 group",
                                            photo.previewUrl
                                                ? "border-[#4C5040]"
                                                : "border-gray-300 hover:border-[#4C5040] bg-[#F7F6F2]",
                                        ].join(" ")}
                                        aria-label="Upload profile photo"
                                    >
                                        {photo.previewUrl ? (
                                            <>
                                                <img
                                                    src={photo.previewUrl}
                                                    alt="Profile preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200">
                                                    <Camera size={22} className="text-white" />
                                                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">
                                                        Change
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-[#4C5040] transition-colors duration-200">
                                                <Camera size={34} strokeWidth={1.5} />
                                                <span className="text-[10px] font-bold tracking-widest uppercase">
                                                    Upload
                                                </span>
                                            </div>
                                        )}
                                    </button>

                                    {/* Browse button */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#4C5040]/30 text-[#4C5040] text-sm font-semibold hover:bg-[#4C5040]/5 hover:border-[#4C5040] transition-all duration-200"
                                    >
                                        <Upload size={14} strokeWidth={2.5} />
                                        {photo.previewUrl ? "Change Photo" : "Browse Photo"}
                                    </button>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    {/* File info */}
                                    {photo.file && (
                                        <p className="text-xs text-gray-400 font-medium text-center">
                                            {photo.file.name}{" "}
                                            <span className="text-gray-300">·</span>{" "}
                                            {(photo.file.size / 1024).toFixed(1)} KB
                                        </p>
                                    )}
                                </div>

                                {/* Navigation row */}
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200"
                                    >
                                        <ArrowLeft size={15} strokeWidth={2.5} />
                                        Back
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={[
                                            "flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold",
                                            "tracking-wide transition-all duration-200 active:scale-[0.98] shadow-sm",
                                            loading
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-[#4C5040] text-[#F7F6F2] hover:bg-[#3c4032]",
                                        ].join(" ")}
                                    >
                                        {loading ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-4 w-4"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8H4z"
                                                    />
                                                </svg>
                                                Creating account…
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <CheckCircle2 size={15} strokeWidth={2.5} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mt-6 text-sm text-gray-500">
                        <p>
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-[#4C5040] font-semibold hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                        <span className="hidden sm:block text-gray-300">·</span>
                        <p>
                            Registering a venue?{" "}
                            <Link
                                to="/register"
                                className="text-[#4C5040] font-semibold hover:underline"
                            >
                                Vendor registration
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRegistration;
