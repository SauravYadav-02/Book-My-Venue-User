import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Calendar, Clock, MapPin, Share2, ShieldCheck, Star, Users, Utensils } from "lucide-react";
import { getVenueById, getVenueImage } from "../../services/VenueUserservice ";
import { type Venue } from "../../types/venue.types";
import { getBookedDatesForVenue } from "../../services/bookingService";
import { type PaymentBooking, type CreateBookingPayload } from "../../services/paymentService";
import { currencyFormatter } from "../../utils/currency";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./VenueDetails.css";
import WishlistButton from "../../components/user/WishlistButton";
import VenueRating from "../../components/user/VenueRating";
import PaymentModal from "../../components/user/PaymentModal";
import { motion } from "framer-motion";

// ── Time slot options ────────────────────────────────────────────────
const TIME_SLOTS = [
    { label: "Morning (08:00 – 12:00)", value: "morning", hours: 4 },
    { label: "Afternoon (12:00 – 16:00)", value: "afternoon", hours: 4 },
    { label: "Evening (16:00 – 20:00)", value: "evening", hours: 4 },
    { label: "Full Day (08:00 – 20:00)", value: "fullday", hours: 12 },
];

const SLOT_MULTIPLIERS: Record<string, number> = {
    morning: 0.4,
    afternoon: 0.45,
    evening: 0.6,
    fullday: 1.0,
};

export default function VenueDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Booking form state
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].value);
    const [guestCount, setGuestCount] = useState<number>(0);
    const [foodType, setFoodType] = useState<string>("none");
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [activeBookings, setActiveBookings] = useState<{ date: string; selectedSlot: string }[]>([]);
    const [isBooking, setIsBooking] = useState(false);

    // Payment modal state
    const [bookingPayload, setBookingPayload] = useState<CreateBookingPayload | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // ── Fetch venue ──────────────────────────────────────────────────
    const fetchVenue = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);

            const data = await getVenueById(id);
            setVenue(data);

            const datesData = await getBookedDatesForVenue(id);
            if (datesData && typeof datesData === 'object' && 'bookedDates' in datesData) {
                setBookedDates(datesData.bookedDates || []);
                setActiveBookings(datesData.activeBookings || []);
            } else if (Array.isArray(datesData)) {
                setBookedDates(datesData);
            }

        } catch (err: unknown) {
            setError((err as Error).message || "Failed to load venue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenue();
    }, [id]);

    const handleRatingUpdate = async () => {
        if (!id) return;
        try {
            const data = await getVenueById(id);
            setVenue(data);
        } catch (err) {
            console.error("Failed to refresh venue after rating:", err);
        }
    };

    const bookedDatesList = bookedDates.map(d => {
        const [y, m, dNum] = d.split('-');
        return new Date(Number(y), Number(m) - 1, Number(dNum));
    });

    const isDateBooked = (date: Date) => {
        return bookedDatesList.some(
            bookedDate =>
                bookedDate.getFullYear() === date.getFullYear() &&
                bookedDate.getMonth() === date.getMonth() &&
                bookedDate.getDate() === date.getDate()
        );
    };

    const isSlotBooked = (date: Date | null, slotValue: string) => {
        if (!date) return false;
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const slotsForDate = activeBookings
            .filter((b) => b.date === formattedDate)
            .map((b) => b.selectedSlot.toLowerCase());

        if (slotsForDate.includes("fullday")) {
            return true;
        }
        if (slotValue === "fullday" && slotsForDate.length > 0) {
            return true;
        }
        return slotsForDate.includes(slotValue.toLowerCase());
    };

    const handleDateChange = (date: Date | null) => {
        if (!date) {
            setEventDate(null);
            return;
        }

        if (isDateBooked(date)) {
            toast.error("This date is already booked. Please select another date.");
            setEventDate(null);
        } else {
            setEventDate(date);
            const currentSlotBooked = isSlotBooked(date, timeSlot);
            if (currentSlotBooked) {
                const availableSlot = TIME_SLOTS.find(slot => !isSlotBooked(date, slot.value));
                if (availableSlot) {
                    setTimeSlot(availableSlot.value);
                }
            }
        }
    };

    const getDayClassName = (date: Date) => {
        return isDateBooked(date) ? "booked-date" : "";
    };

    const handleBooking = async () => {
        if (!eventDate) {
            toast.error("Please select an event date");
            return;
        }

        if (isDateBooked(eventDate)) {
            toast.error("This date is already booked. Please select another date.");
            return;
        }

        if (isSlotBooked(eventDate, timeSlot)) {
            toast.error("This slot is already booked for the selected date.");
            return;
        }

        if (guestCount <= 0) {
            toast.error("Please enter a guest count greater than 0.");
            return;
        }

        if (venue?.capacity && guestCount > venue.capacity) {
            toast.error("The selected venue cannot accommodate the number of guests.");
            return;
        }

        if (venue?.availableFrom) {
            const availableFromDate = new Date(venue.availableFrom);
            availableFromDate.setHours(0, 0, 0, 0);
            const selectedDate = new Date(eventDate);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < availableFromDate) {
                toast.error("Venue is not open for that date.");
                return;
            }
        }

        const userId = localStorage.getItem("userId");
        if (!userId) {
            toast.error("Please login to book a venue");
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        try {
            setIsBooking(true);

            const yyyy = eventDate.getFullYear();
            const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
            const dd = String(eventDate.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd}`;

            setBookingPayload({
                userId,
                vendorId: venue!.vendorId,
                venueId: venue!._id,
                date: formattedDate,
                bookingAmount: total,
                selectedSlot: timeSlot,
                basePrice: basePrice,
                slotMultiplier: multiplier,
                calculatedVenueAmount: calculatedVenueAmount,
                totalAmount: total,
                selectedFoodType: foodType,
                guestCount: guestCount,
                perPlatePrice: perPlatePrice,
                foodTotal: foodTotal,
                venueAmount: calculatedVenueAmount,
                finalAmount: total,
            });

            setShowPaymentModal(true);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to initiate booking");
        } finally {
            setIsBooking(false);
        }
    };

    const handlePaymentComplete = (_updatedBooking: PaymentBooking) => {
        toast.success("Payment confirmed! Your booking is now active.");
        setEventDate(null);
    };

    const handleModalClose = () => {
        setShowPaymentModal(false);
        setBookingPayload(null);
        if (id) {
            getBookedDatesForVenue(id).then((datesData) => {
                if (datesData && typeof datesData === 'object' && 'bookedDates' in datesData) {
                    setBookedDates(datesData.bookedDates || []);
                    setActiveBookings(datesData.activeBookings || []);
                } else if (Array.isArray(datesData)) {
                    setBookedDates(datesData);
                }
            }).catch(console.error);
        }
    };

    // ── Derived pricing ──────────────────────────────────────────────

    const basePrice = venue?.pricePerDay ?? 0;
    const multiplier = SLOT_MULTIPLIERS[timeSlot] ?? 1.0;
    const calculatedVenueAmount = basePrice * multiplier;
    const perPlatePrice = foodType === "veg" ? (venue?.vegPrice ?? 0) : foodType === "nonveg" ? (venue?.nonVegPrice ?? 0) : 0;
    const foodTotal = guestCount * perPlatePrice;
    const serviceFee = 0; // Can be calculated later
    const total = calculatedVenueAmount + foodTotal + serviceFee;

    // ── Loading skeleton ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F6F2] animate-pulse">
                <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="aspect-[16/9] bg-gray-200 rounded-3xl" />
                        <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
                        <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
                        <div className="h-24 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="bg-gray-200 rounded-3xl h-80" />
                </div>
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────────────
    if (error || !venue) {
        return (
            <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 text-lg font-medium">{error ?? "Venue not found"}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-[#5C614D] underline underline-offset-4"
                >
                    Go back
                </button>
            </div>
        );
    }

    const imageUrl = getVenueImage(venue.mediaFiles);
    const location = [venue.city, venue.state, venue.country].filter(Boolean).join(", ");

    let parsedAmenities: string[] = [];
    try {
        if (Array.isArray(venue.amenities)) {
            if (venue.amenities.length === 1 && typeof venue.amenities[0] === 'string' && venue.amenities[0].startsWith('[')) {
                parsedAmenities = JSON.parse(venue.amenities[0]);
            } else {
                parsedAmenities = venue.amenities;
            }
        } else if (typeof venue.amenities === 'string') {
            parsedAmenities = JSON.parse(venue.amenities);
        }
    } catch (e) {
        parsedAmenities = Array.isArray(venue.amenities) ? venue.amenities : [];
    }

    return (
        <div className="min-h-screen bg-[#F7F6F2]">
            {/* ── Back to curation ─────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pt-28 pb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#5C614D] transition-colors duration-200 font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to curation
                </button>
            </div>

            {/* ── Main Content Grid ─────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

                {/* ── Left Column ──────────────────────────────────── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-2 space-y-8"
                >

                    {/* Hero Image */}
                    <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-lg group">
                        <img
                            src={imageUrl}
                            alt={venue.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Action buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                            <WishlistButton venueId={venue._id} className="w-10 h-10" />
                            <button
                                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-gray-600 flex items-center justify-center shadow hover:text-[#5C614D] transition-colors duration-200"
                                aria-label="Share venue"
                            >
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Venue Title & Rating */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#5C614D] bg-[#5C614D]/10 px-3 py-1 rounded-full">
                                <BadgeCheck size={14} />
                                Verified Venue
                            </span>
                            <span className="flex items-center gap-1 text-sm font-semibold text-[#2d2d2d]">
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                {venue.averageRating ? venue.averageRating.toFixed(1) : '0.0'} ({venue.totalReviews ?? venue.ratingCount ?? 0} reviews)
                            </span>
                        </div>

                        {/* Categories & Event Types */}
                        {(venue.venueTypes?.length || venue.eventsSupported?.length) && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {venue.venueTypes && venue.venueTypes.map((t) => (
                                    <span key={t} className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
                                        {t}
                                    </span>
                                ))}
                                {venue.eventsSupported && venue.eventsSupported.map((ev) => (
                                    <span key={ev} className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium px-3 py-1 rounded-full">
                                        {ev}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="text-4xl md:text-5xl font-serif text-[#2d2d2d] leading-tight">
                            {venue.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium">
                            <span className="flex items-center gap-1.5">
                                <MapPin size={15} className="text-[#8A8F78]" />
                                {location}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users size={15} className="text-[#8A8F78]" />
                                Up to {venue.capacity} guests
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* About this space */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-serif text-[#2d2d2d]">About this space</h2>
                        <p className="text-gray-600 leading-relaxed text-base">
                            {venue.description ??
                                "A beautifully curated space designed for extraordinary events. Contact us to learn more about this remarkable venue and its unique offerings."}
                        </p>
                    </div>

                    {/* Amenities */}
                    {parsedAmenities.length > 0 && (
                        <div className="space-y-4">
                            <div className="border-t border-gray-200" />
                            <h2 className="text-xl font-serif text-[#2d2d2d]">Amenities</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {parsedAmenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2.5 text-sm text-[#2d2d2d] font-medium shadow-sm"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#5C614D] shrink-0" />
                                        {amenity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Venue Rating Section */}
                    <VenueRating 
                        venueId={venue._id} 
                        venueName={venue.name} 
                        onRatingUpdate={handleRatingUpdate}
                    />
                </motion.div>

                {/* ── Right Column — Booking Card ───────────────────── */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1 sticky top-28"
                >
                    <div className="bg-white rounded-3xl shadow-[0_4px_40px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden relative">
                        {!venue.isSubscriptionActive && (
                            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
                                <div className="bg-white shadow-2xl rounded-2xl p-6 border border-red-100">
                                    <ShieldCheck size={40} className="text-red-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Booking Unavailable</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Venue is not available for booking yet.
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className={`p-6 space-y-5 ${!venue.isSubscriptionActive ? "opacity-40 grayscale pointer-events-none" : ""}`}>
                            {/* Price header */}
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-serif font-bold text-[#2d2d2d]">
                                    {currencyFormatter.format(basePrice)}
                                </span>
                                <span className="text-sm text-gray-400 font-medium">/ day</span>
                            </div>

                            {/* Event Date */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                    Event Date
                                </label>
                                <div className="relative">
                                    <Calendar
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                    <DatePicker
                                        selected={eventDate}
                                        onChange={handleDateChange}
                                        minDate={venue.availableFrom ? new Date(Math.max(new Date().getTime(), new Date(venue.availableFrom).getTime())) : new Date()}
                                        excludeDates={bookedDatesList}
                                        dayClassName={getDayClassName}
                                        placeholderText="Select a date"
                                        dateFormat="dd/MM/yyyy"
                                        disabled={!venue.isSubscriptionActive}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#2d2d2d] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5C614D]/30 focus:border-[#5C614D] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Time Slot */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                    Time Slot
                                </label>
                                <div className="relative">
                                    <Clock
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                    <select
                                        value={timeSlot}
                                        onChange={(e) => setTimeSlot(e.target.value)}
                                        disabled={!venue.isSubscriptionActive}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#2d2d2d] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5C614D]/30 focus:border-[#5C614D] transition-all appearance-none cursor-pointer"
                                    >
                                        {TIME_SLOTS.map((slot) => {
                                            const disabled = isSlotBooked(eventDate, slot.value);
                                            return (
                                                <option key={slot.value} value={slot.value} disabled={disabled}>
                                                    {slot.label} {disabled ? "(Unavailable)" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Guest Count (Always visible) */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                    Guest Count
                                </label>
                                <div className="relative">
                                    <Users
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Enter guest count"
                                        value={guestCount || ""}
                                        onChange={(e) => {
                                            const val = Math.max(0, parseInt(e.target.value) || 0);
                                            setGuestCount(val);
                                        }}
                                        disabled={!venue.isSubscriptionActive}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#2d2d2d] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5C614D]/30 focus:border-[#5C614D] transition-all"
                                    />
                                </div>
                                {venue.capacity !== undefined && guestCount > venue.capacity && (
                                    <div className="mt-2 text-xs text-red-500 font-semibold leading-relaxed">
                                        Warning: You cannot book this venue because its capacity is less than the number of guests.
                                    </div>
                                )}
                            </div>

                            {/* Food Catering Selection (Conditional on catering prices) */}
                            {(venue.vegPrice || venue.nonVegPrice) && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                        Food Type
                                    </label>
                                    <div className="relative">
                                        <Utensils
                                            size={15}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                        />
                                        <select
                                            value={foodType}
                                            onChange={(e) => setFoodType(e.target.value)}
                                            disabled={!venue.isSubscriptionActive}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-[#2d2d2d] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5C614D]/30 focus:border-[#5C614D] transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="none">None / No Food</option>
                                            {venue.vegPrice != null && (
                                                <option value="veg">Veg ({currencyFormatter.format(venue.vegPrice)}/person)</option>
                                            )}
                                            {venue.nonVegPrice != null && (
                                                <option value="nonveg">Non-Veg ({currencyFormatter.format(venue.nonVegPrice)}/person)</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-gray-100" />

                            {/* Price breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Venue Amount</span>
                                    <span className="text-[#2d2d2d] font-medium">
                                        {currencyFormatter.format(calculatedVenueAmount)}
                                    </span>
                                </div>
                                {foodType !== "none" && (
                                    <div className="flex justify-between text-gray-500">
                                        <span>Food Total</span>
                                        <span className="text-[#2d2d2d] font-medium">
                                            {currencyFormatter.format(foodTotal)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold text-[#2d2d2d] text-base pt-2 border-t border-gray-100">
                                    <span>Grand Total</span>
                                    <span>{currencyFormatter.format(total)}</span>
                                </div>
                            </div>

                            {/* Upfront payment callout */}
                            <div className="bg-[#5C614D]/5 border border-[#5C614D]/10 rounded-xl px-3 py-2.5">
                                <p className="text-xs font-semibold text-[#5C614D] uppercase tracking-wider mb-1.5">Payment Breakdown</p>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Upfront (20% — due now)</span>
                                    <span className="font-bold text-[#5C614D]">{currencyFormatter.format(total * 0.2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Remaining (80% — at event)</span>
                                    <span className="font-medium">{currencyFormatter.format(total * 0.8)}</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                id="book-venue-btn"
                                onClick={handleBooking}
                                disabled={isBooking || !eventDate || isDateBooked(eventDate) || !venue.isSubscriptionActive || (venue.capacity !== undefined && guestCount > venue.capacity)}
                                className="w-full bg-[#5C614D] hover:bg-[#4C5040] disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-[#5C614D]/20 hover:shadow-[#5C614D]/40 hover:-translate-y-0.5 transform cursor-pointer"
                            >
                                {!venue.isSubscriptionActive 
                                    ? "Not available for booking" 
                                    : (venue.capacity !== undefined && guestCount > venue.capacity)
                                    ? "Capacity Exceeded"
                                    : isBooking ? "Creating Booking..." : "Book & Pay Upfront"}
                            </button>

                            <p className="text-center text-xs text-gray-400 font-medium tracking-wide uppercase">
                                20% upfront · balance due at event
                            </p>
                        </div>
                    </div>

                    {/* Secure Booking Badge */}
                    <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 items-start">
                        <ShieldCheck size={20} className="text-[#5C614D] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-[#2d2d2d]">Secure Booking</p>
                            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                                Your booking is protected by our secure platform. We handle all
                                communication and disputes.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && bookingPayload && venue && (
                <PaymentModal
                    bookingPayload={bookingPayload}
                    venueName={venue.name}
                    onClose={handleModalClose}
                    onPaymentComplete={handlePaymentComplete}
                />
            )}
        </div>
    );
}

