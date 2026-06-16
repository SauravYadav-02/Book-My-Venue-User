import { useEffect, useState } from "react";
import { getUserBookings, getRefundPreview, cancelBooking, type Booking, type RefundPreview } from "../../services/bookingService";
import { format } from "date-fns";
import { Calendar, AlertTriangle, X, Receipt, Info } from "lucide-react";
import { currencyFormatter } from "../../utils/currency";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [refundPreview, setRefundPreview] = useState<RefundPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchBookings = async () => {
    if (!userId || userId === "undefined" || userId === "null") {
      window.location.href = "/login";
      return;
    }
    try {
      setLoading(true);
      const res = await getUserBookings(userId);
      setBookings(res.bookings || []);
    } catch (err) {
      console.error("Failed to load user bookings:", err);
      toast.error("Could not load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const handleCancelClick = async (booking: Booking) => {
    if (!userId) return;
    try {
      setCancellingBooking(booking);
      setPreviewLoading(true);
      setCancellationReason("");
      const preview = await getRefundPreview(booking._id, userId);
      setRefundPreview(preview);
    } catch (err: any) {
      console.error("Error loading refund preview:", err);
      toast.error(err.response?.data?.error || "Failed to load refund preview details.");
      setCancellingBooking(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingBooking || !userId) return;
    try {
      setActionLoading(true);
      const result = await cancelBooking(cancellingBooking._id, userId, cancellationReason);
      if (result.success) {
        toast.success(
          result.refundAmount > 0
            ? `Cancelled. Refund of ${currencyFormatter.format(result.refundAmount)} is pending.`
            : "Booking cancelled successfully. No refund applicable."
        );
        setCancellingBooking(null);
        setRefundPreview(null);
        fetchBookings();
      } else {
        toast.error(result.message || "Failed to cancel booking.");
      }
    } catch (err: any) {
      console.error("Cancellation error:", err);
      toast.error(err.response?.data?.error || "Failed to cancel booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "approved":
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case "cancelled":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-rose-50 text-rose-700 border-rose-200/50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-[#F7F6F2] flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#5C614D]/10 rounded-full flex items-center justify-center text-[#5C614D]">
            <Calendar size={32} className="animate-bounce" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#F7F6F2] w-full flex justify-center">
      <div className="max-w-6xl w-full px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-[#5C614D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#5C614D]">
            <Receipt size={32} />
          </div>
          <h1 className="text-3xl font-serif text-[#2d2d2d] font-bold">My Bookings</h1>
          <p className="text-gray-500 mt-2">Manage your current bookings and cancellation refunds</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
              <Calendar size={28} />
            </div>
            <h3 className="text-lg font-serif text-[#2d2d2d] font-semibold mb-2">No bookings found</h3>
            <p className="text-stone-400 text-sm mb-8 leading-relaxed">
              You haven't booked any venues yet. Explore and find the perfect space for your event!
            </p>
            <a
              href="/discover"
              className="inline-flex px-6 py-3 bg-[#5C614D] hover:bg-[#4C5040] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              Discover Venues
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const b = booking as any;
              const dateObj = new Date(b.date);
              const formattedDate = isNaN(dateObj.getTime()) ? b.date : format(dateObj, "dd MMM yyyy");
              const isCancelable = ["pending", "approved", "success"].includes(b.status);

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Venue & Date */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-serif text-[#2d2d2d] font-bold text-lg leading-snug">
                          {b.venueId?.name || "Venue Space"}
                        </h3>
                        <p className="text-xs text-[#5C614D] font-medium mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {formattedDate}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(
                          b.status
                        )}`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <hr className="border-stone-100 my-4" />

                    {/* Details List */}
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Slot:</span>
                        <span className="font-semibold text-stone-700 capitalize">
                          {b.selectedSlot || "Full Day"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Guests:</span>
                        <span className="font-semibold text-stone-700">{b.guestCount || "0"} guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Amount Paid:</span>
                        <span className="font-bold text-stone-800">
                          {currencyFormatter.format(b.amountPaid || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Total Booking:</span>
                        <span className="font-semibold text-stone-600">
                          {currencyFormatter.format(b.finalAmount || b.totalBookingAmount || b.cost || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Cancellation Details if Cancelled */}
                    {b.status === "cancelled" && b.cancellation && (
                      <div className="mt-4 p-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-xs space-y-1.5 text-stone-600">
                        <p className="font-bold text-stone-700 flex items-center gap-1">
                          <Info size={12} /> Cancellation Details:
                        </p>
                        <p>
                          <span className="text-stone-400">Refund: </span>
                          <span className="font-bold text-emerald-600">
                            {currencyFormatter.format(b.cancellation.refundAmount || 0)}
                          </span>
                          <span className="text-stone-400"> ({b.cancellation.refundTier || "none"} tier)</span>
                        </p>
                        <p>
                          <span className="text-stone-400">Status: </span>
                          <span className="capitalize font-semibold text-stone-600">
                            {b.cancellation.refundStatus || "none"}
                          </span>
                        </p>
                        {b.cancellation.reason && (
                          <p className="italic text-stone-400 mt-1 truncate">
                            "Reason: {b.cancellation.reason}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isCancelable && (
                    <div className="mt-6 pt-4 border-t border-stone-50">
                      <button
                        onClick={() => handleCancelClick(b)}
                        className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {cancellingBooking && (
          <div className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!actionLoading) {
                  setCancellingBooking(null);
                  setRefundPreview(null);
                }
              }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-100 z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-serif text-[#2d2d2d] font-bold">Cancel Booking</h3>
                  <p className="text-stone-400 text-sm mt-1">
                    Review tiered refund rules for <span className="font-semibold text-stone-600">{(cancellingBooking as any).venueId?.name}</span>
                  </p>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => {
                    setCancellingBooking(null);
                    setRefundPreview(null);
                  }}
                  className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {previewLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-[#5C614D] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-stone-500 font-medium">Calculating refund preview...</p>
                </div>
              ) : (
                refundPreview && (
                  <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                    {/* Refund Tiers Table */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Info size={14} /> Refund Policy Matrix
                      </h4>
                      <div className="border border-stone-100 rounded-2xl overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold">
                              <th className="p-3">Cancellation Timing</th>
                              <th className="p-3">Refund Eligibility</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-stone-600 font-medium">
                            <tr className={refundPreview.refundTier === "full" ? "bg-emerald-50 text-emerald-800" : ""}>
                              <td className="p-3">&gt; 45 days before event</td>
                              <td className="p-3">Full refund minus upfront deposit</td>
                            </tr>
                            <tr className={refundPreview.refundTier === "50%" ? "bg-emerald-50 text-emerald-800" : ""}>
                              <td className="p-3">30 – 45 days before event</td>
                              <td className="p-3">50% of amount paid</td>
                            </tr>
                            <tr className={refundPreview.refundTier === "25%" ? "bg-emerald-50 text-emerald-800" : ""}>
                              <td className="p-3">15 – 30 days before event</td>
                              <td className="p-3">25% of amount paid</td>
                            </tr>
                            <tr className={refundPreview.refundTier === "none" ? "bg-rose-50 text-rose-800 font-bold" : ""}>
                              <td className="p-3">&lt; 15 days before event</td>
                              <td className="p-3">No refund (₹0)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Calculated Summary */}
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-stone-400 block mb-0.5">Days to Event</span>
                        <span className="font-bold text-stone-700 flex items-center gap-1">
                          {refundPreview.daysBeforeEvent} Days
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 block mb-0.5">Total Amount Paid</span>
                        <span className="font-bold text-stone-700">
                          {currencyFormatter.format(refundPreview.amountPaid)}
                        </span>
                      </div>
                      <div className="col-span-2 border-t border-stone-200/50 pt-3 flex justify-between items-center mt-1">
                        <div>
                          <span className="text-xs text-stone-400 block">Calculated Refund Tier</span>
                          <span className="font-bold text-stone-800 capitalize flex items-center gap-1 mt-0.5">
                            {refundPreview.refundTier} Refund
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-stone-400 block">Refund Amount</span>
                          <span className="text-lg font-bold text-emerald-600 block mt-0.5">
                            {currencyFormatter.format(refundPreview.refundAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Warning message if no refund */}
                    {refundPreview.refundAmount === 0 && (
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-xs text-rose-800 font-medium">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="font-bold">No Refund Applicable</p>
                          <p className="mt-0.5 leading-relaxed text-rose-700/90">
                            {refundPreview.refundTier === "none" ? (
                              `Because your event is scheduled in less than 15 days (specifically ${refundPreview.daysBeforeEvent} days), this booking is non-refundable. Cancelling will forfeit the amount paid.`
                            ) : (
                              `Because you have only paid the non-refundable upfront deposit for this booking, no refund is applicable. Cancelling will forfeit the deposit paid.`
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reason input */}
                    <div className="space-y-2">
                      <label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                        Reason for cancellation (optional)
                      </label>
                      <textarea
                        id="reason"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        disabled={actionLoading}
                        placeholder="Please share the reason for your cancellation..."
                        className="w-full p-4 border border-stone-200 rounded-2xl text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#5C614D] focus:border-[#5C614D] bg-stone-50/50 min-h-[80px]"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2 mt-4">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          setCancellingBooking(null);
                          setRefundPreview(null);
                        }}
                        className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors"
                      >
                        Keep Booking
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleConfirmCancellation}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-md shadow-red-600/10 flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Confirm Cancellation"
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
