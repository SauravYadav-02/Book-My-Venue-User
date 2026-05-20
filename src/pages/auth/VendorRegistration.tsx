/**
 * VendorRegistration.tsx  (User-app)
 * Exact replica of Book-My-Venue-Vendor  VendorRegistrationForm + all sub-components,
 * inlined into one file so no extra files are needed in the user app.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    User, Mail, Phone, Building2, FileText, CheckCircle2, ArrowRight,
} from "lucide-react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// Types  (mirror of formTypes.ts + vendorTypes.ts)
// ─────────────────────────────────────────────────────────────────────────────
type FormValues = {
    fullName: string;
    email: string;
    phone: string;
    businessName: string;
    businessType: string;
    governmentId: File | null;
    address: string;
    pincode: string;
    state: string;
    licenseDoc: File | null;
};

type Touched = Partial<Record<keyof FormValues, boolean>>;
type Errors  = Partial<Record<keyof FormValues, string>>;

type Field = {
    id: keyof FormValues;
    label: string;
    icon: React.ElementType;
    type?: string;
    placeholder?: string;
    section: "personal" | "business" | "security";
    options?: string[];
    required?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Indian States  (mirror of states.ts)
// ─────────────────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // UTs
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry",
];

// ─────────────────────────────────────────────────────────────────────────────
// Validation  (mirror of validate.ts)
// ─────────────────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

function validate(v: FormValues): Errors {
    const e: Errors = {};

    if (!v.fullName) e.fullName = "Required";

    if (!v.email) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
        e.email = "Invalid email";

    if (!v.phone) e.phone = "Required";
    else if (!/^\d{10}$/.test(v.phone))
        e.phone = "Invalid phone";

    if (!v.businessName) e.businessName = "Required";
    if (!v.businessType) e.businessType = "Required";

    if (!v.governmentId) {
        e.governmentId = "Required";
    } else if (v.governmentId.size > MAX_FILE_SIZE) {
        e.governmentId = "Image must be less than 15MB";
    }

    if (!v.licenseDoc) {
        e.licenseDoc = "Required";
    } else if (v.licenseDoc.size > MAX_FILE_SIZE) {
        e.licenseDoc = "Image must be less than 15MB";
    }

    if (!v.address) e.address = "Required";
    if (!v.pincode) e.pincode = "Required";
    if (!v.state)   e.state   = "Required";

    return e;
}

// ─────────────────────────────────────────────────────────────────────────────
// createVendor service  (mirror of vendorService.ts)
// ─────────────────────────────────────────────────────────────────────────────
// const API_URL = "http://localhost:3000/vendors/register";
const API_URL = "http://192.168.1.14:3000/vendors/register";

async function createVendor(data: FormValues): Promise<void> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, value as string | Blob);
        }
    });
    formData.append("status", "pending");
    formData.append("adminMessage", "");

    await axios.post(API_URL, formData);
}

// ─────────────────────────────────────────────────────────────────────────────
// InputField  (mirror of components/InputField.tsx)
// ─────────────────────────────────────────────────────────────────────────────
type InputFieldProps = {
    label: string;
    icon: React.ElementType;
    value: any;
    error?: string;
    touched?: boolean;
    onChange: (val: any) => void;
    onBlur: () => void;
    type?: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
};

function InputField({
    label,
    icon: Icon,
    value,
    error,
    touched,
    onChange,
    onBlur,
    type = "text",
    placeholder,
    options,
    required,
}: InputFieldProps) {
    const hasError = error && touched;

    const baseClass = `
        w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-white
        border border-gray-200 text-gray-800 placeholder-gray-400
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-4 
        ${hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 shadow-sm shadow-red-100"
            : "hover:border-indigo-300 focus:border-indigo-600 focus:ring-indigo-600/20 shadow-sm hover:shadow-md"
        }
    `;

    return (
        <div className="space-y-1.5 flex flex-col items-start group">
            <label className="text-[11px] font-bold tracking-wider text-gray-400 uppercase ml-1 transition-colors group-focus-within:text-indigo-600 flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative w-full">
                <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${hasError ? "text-red-400" : "text-gray-400 group-focus-within:text-indigo-500"}`} />

                {type === "select" ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        className={`${baseClass} appearance-none cursor-pointer`}
                    >
                        <option value="" disabled>Select {label}</option>
                        {options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : type === "file" ? (
                    <input
                        type="file"
                        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                        onBlur={onBlur}
                        className={`${baseClass} file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer p-1.5`}
                    />
                ) : (
                    <input
                        type={type}
                        value={value as string}
                        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        className={baseClass}
                    />
                )}
                {type === "select" && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                )}
            </div>

            {hasError && (
                <p className="text-xs font-medium text-red-500 pl-1">{error}</p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormSection  (mirror of components/FormSection.tsx)
// ─────────────────────────────────────────────────────────────────────────────
type FormSectionProps = {
    title: string;
    subtitle?: string;
    fields: Field[];
    values: FormValues;
    errors: Errors;
    touched: Touched;
    set: (id: keyof FormValues, val: any) => void;
    blur: (id: keyof FormValues) => void;
};

function FormSection({ title, subtitle, fields, values, errors, touched, set, blur }: FormSectionProps) {
    return (
        <div className="relative p-6 sm:p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="mb-6 flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full inline-block"></span>
                    {title}
                </h2>
                {subtitle && <p className="text-sm text-gray-500 ml-3.5 leading-relaxed">{subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {fields.map(field => (
                    <InputField
                        key={field.id}
                        {...field}
                        value={values[field.id] as any}
                        error={errors[field.id]}
                        touched={touched[field.id]}
                        onChange={(val) => set(field.id, val)}
                        onBlur={() => blur(field.id)}
                    />
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SuccessScreen  (mirror of components/SuccessScreen.tsx)
// ─────────────────────────────────────────────────────────────────────────────
function SuccessScreen({ name, reset }: { name: string; reset: () => void }) {
    return (
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] text-center space-y-6 transform transition-all duration-500 hover:scale-[1.02]">
            <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Success! 🎉</h2>
                <p className="text-gray-500 text-lg">
                    <span className="font-semibold text-indigo-600">{name}</span>, your registration was submitted successfully.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                    Our team will review your application and get back to you shortly.
                </p>
            </div>

            <div className="pt-6">
                <button
                    onClick={reset}
                    className="group inline-flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-600 transition-all py-3.5 px-6 rounded-xl font-bold text-lg"
                >
                    Register another business
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Extra: back to login link */}
            <p className="text-sm text-gray-400">
                <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                    Back to Login
                </Link>
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field definitions  (mirror of VendorRegistrationForm.tsx FIELDS)
// ─────────────────────────────────────────────────────────────────────────────
const INIT: FormValues = {
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    governmentId: null,
    address: "",
    pincode: "",
    state: "",
    licenseDoc: null,
};

const FIELDS: Field[] = [
    { id: "fullName",     label: "Full Name",         icon: User,       section: "personal", required: true },
    { id: "email",        label: "Email Address",     icon: Mail,       section: "personal", type: "email",  required: true },
    { id: "phone",        label: "Phone Number",      icon: Phone,      section: "personal", type: "tel",    required: true },

    { id: "businessName", label: "Business Name",     icon: Building2,  section: "business", required: true },
    { id: "businessType", label: "Business Type",     icon: Building2,  section: "business", required: true },
    { id: "governmentId", label: "Government ID",     icon: FileText,   section: "business", type: "file",   required: true },
    { id: "licenseDoc",   label: "License Document",  icon: FileText,   section: "business", type: "file",   required: true },
    { id: "address",      label: "Full Address",      icon: Building2,  section: "business", required: true },
    { id: "pincode",      label: "Pincode",           icon: Building2,  section: "business", required: true },
    {
        id: "state",
        label: "State",
        icon: Building2,
        section: "business",
        type: "select",
        options: INDIAN_STATES,
        required: true,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Page  (mirror of VendorRegistrationForm.tsx — exact same JSX)
// ─────────────────────────────────────────────────────────────────────────────
export default function VendorRegistration() {
    const [values, setValues] = useState<FormValues>(INIT);
    const [touched, setTouched] = useState<Touched>({});
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const errors = validate(values);

    const set = (id: keyof FormValues, val: any) => {
        setValues(v => ({ ...v, [id]: val }));
    };

    const blur = (id: keyof FormValues) => {
        setTouched(t => ({ ...t, [id]: true }));
    };

    async function handleSubmit() {
        setTouched(Object.keys(values).reduce((a, k) => ({ ...a, [k]: true }), {}));

        if (Object.values(errors).some(Boolean)) return;

        setStatus("submitting");
        try {
            await createVendor(values);
            setStatus("success");
        } catch {
            setStatus("error");
        }
    }

    // ── Success screen ───────────────────────────────────────────────────────
    if (status === "success") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <SuccessScreen
                    name={values.fullName}
                    reset={() => {
                        setValues(INIT);
                        setTouched({});
                        setStatus("idle");
                    }}
                />
            </div>
        );
    }

    // ── Registration form ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex text-gray-800 bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* ── Left Side: Branding (hidden on mobile) ─────────────────── */}
            <div className="hidden lg:flex lg:w-5/12 bg-indigo-900 relative overflow-hidden flex-col justify-between items-start text-white p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-900 to-indigo-900 opacity-90 z-0"></div>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse transition duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse transition duration-1000 delay-500"></div>

                <div className="relative z-10 w-full">
                    <div className="flex items-center gap-3 text-2xl font-bold tracking-tight mb-16">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-900 shadow-lg">
                            <Building2 className="w-6 h-6" />
                        </div>
                        BookMyVenue
                    </div>

                    <div className="space-y-6 max-w-md">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                            Partner with us <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                                Grow your business.
                            </span>
                        </h1>
                        <p className="text-lg text-indigo-200 leading-relaxed font-light">
                            Join thousands of top-rated venues and vendors managing their bookings seamlessly. Reach more customers, effortlessly.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full">
                    <div className="space-y-4">
                        {[
                            "Access to thousands of daily users",
                            "Advanced analytics and dashboard",
                            "Secure, automated fast payouts",
                            "24/7 dedicated partner support",
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-indigo-100">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Side: Form ────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto w-full bg-[#f8fafc]">

                {/* Mobile header (visible only on small screens) */}
                <div className="lg:hidden w-full max-w-2xl text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6 text-white">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Vendor Registration</h1>
                    <p className="text-gray-500 font-medium">Join our network of premium venues and vendors.</p>
                </div>

                <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
                    <div className="hidden lg:block mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Let's build together</h2>
                        <p className="text-gray-500 text-lg">Please fill in your details to create your partner account.</p>
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                        encType="multipart/form-data"
                        className="space-y-8"
                    >
                        <FormSection
                            title="Personal Information"
                            subtitle="We'll use this to communicate with you about your account."
                            fields={FIELDS.filter(f => f.section === "personal")}
                            values={values}
                            errors={errors}
                            touched={touched}
                            set={set}
                            blur={blur}
                        />

                        <FormSection
                            title="Business Details"
                            subtitle="Information about your company and physical location."
                            fields={FIELDS.filter(f => f.section === "business")}
                            values={values}
                            errors={errors}
                            touched={touched}
                            set={set}
                            blur={blur}
                        />

                        {status === "error" && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Something went wrong while submitting. Please try again.</span>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className={`w-full group relative flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                                ${status === "submitting" ? "opacity-70 cursor-not-allowed transform-none hover:-translate-y-0 hover:shadow-none" : ""}
                                `}
                            >
                                {status === "submitting" ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    "Complete Registration"
                                )}
                            </button>
                            <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                                By submitting, you agree to our{" "}
                                <a href="#" className="text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">Terms of Service</a>
                                {" "}and{" "}
                                <a href="#" className="text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">Privacy Policy</a>.
                            </p>
                            <p className="text-center text-sm text-gray-500 mt-3 font-medium">
                                Already have an account?{" "}
                                <Link to="/login" className="text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
