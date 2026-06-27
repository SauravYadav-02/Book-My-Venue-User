import { useEffect, useState } from "react";
import { getUserBookings, type BookingResponse } from "../../services/bookingService";
import { getUserById, updateUser } from "../../services/userService";
import type { UserProfile } from "../../types/user.types";
import { format } from "date-fns";
import { CalendarDays, MapPin, CheckCircle, XCircle, Edit3, Camera, Save, Phone, Home } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookingData, setBookingData] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId || userId === "undefined" || userId === "null") {
        window.location.href = "/login";
        return;
      }

      try {
        const [userData, bookings] = await Promise.all([
          getUserById(userId),
          getUserBookings(userId),
        ]);
        setUser(userData);
        setBookingData(bookings);

        // Initialize edit states
        setName(userData.name || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
        setCity(userData.city || "");
        setPinCode(userData.pinCode || "");
        setPreviewUrl(userData.profilePhoto || null);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2 || name.trim().length > 50) {
      e.name = "Name must be between 2 and 50 characters.";
    }
    const emailRe = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRe.test(email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      e.phone = "Phone number must be exactly 10 digits.";
    }
    if (!city.trim() || city.trim().length > 50) {
      e.city = "City is required (max 50 characters).";
    }
    if (!address.trim() || address.trim().length > 200) {
      e.address = "Address is required (max 200 characters).";
    }
    if (!pinCode || !/^\d{6}$/.test(pinCode)) {
      e.pinCode = "Pin code must be exactly 6 digits.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please resolve the validation errors.");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("pinCode", pinCode);
      if (file) {
        formData.append("profilePhoto", file);
      }

      const response = await updateUser(userId, formData);
      toast.success(response.message || "Profile updated successfully!");
      setUser(response.user);
      
      // Sync local state
      setName(response.user.name || "");
      setEmail(response.user.email || "");
      setPhone(response.user.phone || "");
      setAddress(response.user.address || "");
      setCity(response.user.city || "");
      setPinCode(response.user.pinCode || "");
      setPreviewUrl(response.user.profilePhoto || null);
      setFile(null);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update profile", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setPinCode(user.pinCode || "");
      setPreviewUrl(user.profilePhoto || null);
      setFile(null);
      setErrors({});
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-[#F7F6F2] flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#F7F6F2]">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Profile Card / Edit Form */}
        {isEditing ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-serif text-[#2d2d2d] mb-6">Edit Profile</h2>
            
            {/* Image Preview / File Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-[#F7F6F2] shadow-inner mb-3 cursor-pointer">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500 font-serif">
                    {name.charAt(0) || "U"}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} />
                  <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400">Click on the image circle to upload a new profile photo</p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-[#2d2d2d] bg-gray-50/30 outline-none transition-all ${
                    errors.name ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#5C614D] focus:ring-2 focus:ring-[#5C614D]/10"
                  }`}
                />
                {errors.name && <span className="text-xs text-red-500 font-medium">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-[#2d2d2d] bg-gray-50/30 outline-none transition-all ${
                    errors.email ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#5C614D] focus:ring-2 focus:ring-[#5C614D]/10"
                  }`}
                />
                {errors.email && <span className="text-xs text-red-500 font-medium">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-[#2d2d2d] bg-gray-50/30 outline-none transition-all ${
                    errors.phone ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#5C614D] focus:ring-2 focus:ring-[#5C614D]/10"
                  }`}
                />
                {errors.phone && <span className="text-xs text-red-500 font-medium">{errors.phone}</span>}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-[#2d2d2d] bg-gray-50/30 outline-none transition-all ${
                    errors.city ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#5C614D] focus:ring-2 focus:ring-[#5C614D]/10"
                  }`}
                />
                {errors.city && <span className="text-xs text-red-500 font-medium">{errors.city}</span>}
              </div>

              {/* Pin Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pin Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  maxLength={6}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-[#2d2d2d] bg-gray-50/30 outline-none transition-all ${
                    errors.pinCode ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#5C614D] focus:ring-2 focus:ring-[#5C614D]/10"
                  }`}
                />
                {errors.pinCode && <span className="text-xs text-red-500 font-medium">{errors.pinCode}</span>}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-[#2d2d2d] bg-gray-50/30 outline-none transition-all ${
                    errors.address ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-[#5C614D] focus:ring-2 focus:ring-[#5C614D]/10"
                  }`}
                />
                {errors.address && <span className="text-xs text-red-500 font-medium">{errors.address}</span>}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="bg-[#5C614D] hover:bg-[#4C5040] text-[#F7F6F2] px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          /* View Mode Header Card */
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F7F6F2] shadow-inner shrink-0">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 font-serif">${user.name.charAt(0)}</div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 font-serif">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-serif text-[#2d2d2d]">{user?.name}</h1>
                <p className="text-gray-500 mt-1">{user?.email}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                  <MapPin size={14} />
                  <span>{user?.city || "City not set"}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#5C614D] hover:bg-[#4C5040] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer text-sm"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        )}

        {/* View Mode: Profile Info Details Card */}
        {!isEditing && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-[#2d2d2d] mt-0.5">{user?.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Home size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                <p className="text-sm font-semibold text-[#2d2d2d] mt-0.5 truncate max-w-[200px]" title={user?.address}>
                  {user?.address || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pin Code / City</p>
                <p className="text-sm font-semibold text-[#2d2d2d] mt-0.5">
                  {user?.pinCode ? `${user.pinCode} - ` : ""}{user?.city || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <CalendarDays size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Bookings</p>
              <p className="text-3xl font-serif text-[#2d2d2d] mt-1">{bookingData?.totalBookings || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
              <span className="text-2xl font-bold">₹</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-3xl font-serif text-[#2d2d2d] mt-1">₹{bookingData?.totalSpent?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <h2 className="text-2xl font-serif text-[#2d2d2d] mb-6">Booking History</h2>
        
        {bookingData?.bookings && bookingData.bookings.length > 0 ? (
          <div className="space-y-4">
            {bookingData.bookings.map((booking) => {
              const total = (booking as any).totalBookingAmount || booking.cost || 0;
              const paid = (booking as any).amountPaid || 0;
              const remaining = Math.max(total - paid, 0);
              const paymentStatus: string = (booking as any).paymentStatus || "pending";
              return (
                <div key={booking._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#2d2d2d] mb-2">
                        {booking.venueId?.name || "Unknown Venue"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={16} />
                          {format(new Date(booking.date), 'dd/MM/yyyy')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={16} />
                          {booking.venueId?.location || "Location not provided"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                      <div className="text-xl font-serif font-semibold text-[#2d2d2d]">
                        ₹{total.toLocaleString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
                        paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                        paymentStatus === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {paymentStatus === 'success' && <CheckCircle size={12} />}
                        {paymentStatus === 'failed' && <XCircle size={12} />}
                        {paymentStatus === 'cancelled' && <XCircle size={12} className="text-slate-500" />}
                        {paymentStatus === 'pending' ? 'Payment Pending' : paymentStatus === 'success' ? 'Paid' : (paymentStatus === 'cancelled' ? 'Cancelled' : 'Failed')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Total</p>
                      <p className="text-sm font-bold text-[#2d2d2d]">₹{total.toLocaleString()}</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${paid > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Paid (20%)</p>
                      <p className={`text-sm font-bold ${paid > 0 ? 'text-green-700' : 'text-gray-400'}`}>₹{paid.toLocaleString()}</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${remaining > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Remaining</p>
                      <p className={`text-sm font-bold ${remaining > 0 ? 'text-amber-600' : 'text-gray-400'}`}>₹{remaining.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <CalendarDays size={32} />
            </div>
            <h3 className="text-xl font-serif text-[#2d2d2d] mb-2">No bookings yet</h3>
            <p className="text-gray-500">When you book a venue, it will appear here.</p>
          </div>
        )}

      </div>
    </div>
  );
}
