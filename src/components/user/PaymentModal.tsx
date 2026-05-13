import { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  CreditCard,
  RotateCcw,
  Loader2,
  Receipt,
  ShieldCheck,
  CalendarDays,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { simulatePayment, createPaymentBooking, type PaymentBooking, type CreateBookingPayload } from "../../services/paymentService";
import { currencyFormatter } from "../../utils/currency";

interface PaymentModalProps {
  bookingPayload: CreateBookingPayload;
  venueName: string;
  onClose: () => void;
  onPaymentComplete: (updatedBooking: PaymentBooking) => void;
}

type PaymentStep = "summary" | "confirmation" | "processing" | "success" | "failed";

export default function PaymentModal({
  bookingPayload,
  venueName,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("summary");
  const [paidBooking, setPaidBooking] = useState<PaymentBooking | null>(null);

  const totalAmount = bookingPayload.bookingAmount || 0;
  const upfrontAmount = totalAmount * 0.2;
  const remainingAmount = totalAmount - upfrontAmount;

  // 1. opening modal
  const handleOpenConfirmation = () => {
    setStep("confirmation");
  };

  // 2. confirming payment
  const handleConfirmPayment = async () => {
    setStep("processing");
    try {
      // Create the booking ONLY when confirming payment
      const createResult = await createPaymentBooking(bookingPayload);
      const bookingId = createResult.booking._id;

      // Process payment outcome as success
      const result = await simulatePayment({ bookingId, outcome: "success" });
      handleFinalPaymentStatus(result.booking);
    } catch {
      setStep("failed");
    }
  };

  // 3. cancelling payment
  const handleCancelPayment = () => {
    // If cancelled before payment confirmation, just close the modal without creating a booking.
    onClose();
  };

  // 4. handling final payment status
  const handleFinalPaymentStatus = (updatedBooking: PaymentBooking) => {
    setPaidBooking(updatedBooking);
    if (updatedBooking.paymentStatus === "success") {
      setStep("success");
      onPaymentComplete(updatedBooking);
    } else {
      setStep("failed");
    }
  };

  const handleRetry = () => {
    setStep("summary");
    setPaidBooking(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      id="payment-modal-overlay"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== "processing" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Close button */}
        {step !== "processing" && (
          <button
            onClick={onClose}
            id="payment-modal-close"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
            aria-label="Close payment modal"
          >
            <X size={17} className="text-gray-600" />
          </button>
        )}

        {/* ── STEP: SUMMARY ──────────────────────────────────────────── */}
        {step === "summary" && (
          <div>
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-[#5C614D] to-[#3d4134] px-6 pt-8 pb-6 text-white">
              <div className="flex items-center gap-3 mb-1">
                <Receipt size={22} className="opacity-80" />
                <span className="text-xs font-bold tracking-widest uppercase opacity-70">
                  Booking Summary
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold mt-1">{venueName}</h2>
              <div className="flex items-center gap-1.5 mt-2 text-white/70 text-sm">
                <CalendarDays size={14} />
                <span>{format(new Date(bookingPayload.date), 'dd/MM/yyyy')}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Amount breakdown */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Total Booking Amount</span>
                  <span className="font-semibold text-[#2d2d2d]">
                    {currencyFormatter.format(totalAmount)}
                  </span>
                </div>

                <div className="border-t border-gray-200" />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-[#2d2d2d]">Upfront Payment (20%)</p>
                    <p className="text-xs text-gray-400 mt-0.5">Due now to confirm booking</p>
                  </div>
                  <span className="text-lg font-bold text-[#5C614D]">
                    {currencyFormatter.format(upfrontAmount)}
                  </span>
                </div>

                <div className="border-t border-gray-200" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Remaining Balance (80%)</span>
                  <span className="font-semibold text-gray-400">
                    {currencyFormatter.format(remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <ShieldCheck size={17} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Only <strong>{currencyFormatter.format(upfrontAmount)}</strong> will be charged
                  now. The remaining <strong>{currencyFormatter.format(remainingAmount)}</strong> is
                  due before the event.
                </p>
              </div>

              {/* Pay Now button */}
              <button
                id="pay-now-btn"
                onClick={handleOpenConfirmation}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#5C614D] to-[#4C5040] hover:from-[#4C5040] hover:to-[#3d4134] text-white py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-[#5C614D]/25 hover:shadow-[#5C614D]/40 hover:-translate-y-0.5 transform"
              >
                <CreditCard size={18} />
                Pay {currencyFormatter.format(upfrontAmount)} Now
              </button>

              <p className="text-center text-xs text-gray-400">
                Secure mock payment simulation · No real charges
              </p>
            </div>
          </div>
        )}

        {/* ── STEP: CONFIRMATION ───────────────────────────────────────── */}
        {step === "confirmation" && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheck size={32} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#2d2d2d]">Confirm Payment</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to proceed with the payment of <strong>{currencyFormatter.format(upfrontAmount)}</strong>?
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                id="cancel-payment-btn"
                onClick={handleCancelPayment}
                className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                id="confirm-payment-btn"
                onClick={handleConfirmPayment}
                className="flex-1 bg-[#5C614D] hover:bg-[#4C5040] text-white py-3.5 rounded-2xl font-semibold text-sm transition-colors duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: PROCESSING ───────────────────────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-16 px-8 gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#5C614D]/10 flex items-center justify-center">
                <Loader2 size={36} className="text-[#5C614D] animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-serif text-[#2d2d2d] font-bold">Processing Payment</h3>
              <p className="text-sm text-gray-500 mt-2">
                Simulating payment gateway. Please wait...
              </p>
            </div>
            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-[#5C614D] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ──────────────────────────────────────────── */}
        {step === "success" && paidBooking && (
          <div>
            {/* Success header */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-6 pt-8 pb-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold">Payment Successful!</h2>
              <p className="text-white/80 text-sm mt-1">Your booking is confirmed</p>
            </div>

            {/* Payment details */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Total Booking Amount</span>
                  <span className="font-semibold text-[#2d2d2d]">
                    {currencyFormatter.format(paidBooking.totalBookingAmount || paidBooking.cost)}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Amount Paid (20%)</span>
                  <span className="font-bold text-emerald-600">
                    {currencyFormatter.format(paidBooking.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Remaining Balance</span>
                  <span className="font-semibold text-amber-600">
                    {currencyFormatter.format(
                      Math.max(
                        (paidBooking.totalBookingAmount || paidBooking.cost) -
                          paidBooking.amountPaid,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={11} />
                    Paid
                  </span>
                </div>
                {paidBooking.transactionId && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {paidBooking.transactionId}
                    </span>
                  </div>
                )}
              </div>

              <button
                id="payment-success-close-btn"
                onClick={onClose}
                className="w-full bg-[#5C614D] hover:bg-[#4C5040] text-white py-3.5 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: FAILED ───────────────────────────────────────────── */}
        {step === "failed" && (
          <div>
            {/* Failure header */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 pt-8 pb-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold">Payment Failed</h2>
              <p className="text-white/80 text-sm mt-1">
                Something went wrong. Please try again.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                <p className="text-sm text-red-600 font-medium">
                  The payment simulation was unsuccessful.
                </p>
                <p className="text-xs text-red-400 mt-1">
                  No amount has been charged. You can safely retry.
                </p>
              </div>

              {/* Venue info */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <Building2 size={20} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#2d2d2d]">{venueName}</p>
                  <p className="text-xs text-gray-500">
                    Upfront due: {currencyFormatter.format(upfrontAmount)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  id="payment-cancel-btn"
                  onClick={onClose}
                  className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  id="payment-retry-btn"
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#5C614D] hover:bg-[#4C5040] text-white py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200"
                >
                  <RotateCcw size={15} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
