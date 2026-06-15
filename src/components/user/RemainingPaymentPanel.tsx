import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { type Transaction } from "../../types/remainingPayment";
import { currencyFormatter } from "../../utils/currency";
import { CreditCard, Receipt, Loader2 } from "lucide-react";
import { payRemainingOnline, getUserBookingTransactions } from "../../services/remainingPaymentService";

interface RemainingPaymentPanelProps {
  booking: {
    bookingId: string;
    finalAmount: number;
    amountPaid: number;
    remainingAmount: number;
    balancePaymentStatus: "unpaid" | "partial" | "paid";
  };
  onSuccess?: () => void;
}

export const RemainingPaymentPanel: React.FC<RemainingPaymentPanelProps> = ({
  booking,
  onSuccess,
}) => {
  const [localBooking, setLocalBooking] = useState(booking);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const bookingId = booking.bookingId;
  const finalAmount = localBooking.finalAmount ?? 0;
  const amountPaid = localBooking.amountPaid ?? 0;
  const remainingAmount = localBooking.remainingAmount ?? 0;
  const balancePaymentStatus = localBooking.balancePaymentStatus ?? "unpaid";

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const res = await getUserBookingTransactions(bookingId);
      if (res.success) {
        setTransactions(res.transactions);
      }
    } catch (err: any) {
      console.error("Failed to load transactions", err);
    } finally {
      setTransactionsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    setLocalBooking(booking);
    fetchTransactions();
  }, [booking, fetchTransactions]);

  const handlePayOnline = async () => {
    setLoading(true);
    try {
      const res = await payRemainingOnline(bookingId);
      if (res.success) {
        toast.success("Remaining payment paid successfully!");
        // Update local state
        setLocalBooking({
          bookingId: res.booking._id || bookingId,
          finalAmount: res.booking.finalAmount || res.booking.totalBookingAmount || res.booking.cost || finalAmount,
          amountPaid: res.booking.amountPaid ?? (amountPaid + remainingAmount),
          remainingAmount: res.booking.remainingAmount ?? 0,
          balancePaymentStatus: res.booking.balancePaymentStatus || "paid",
        });
        
        await fetchTransactions();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to make online payment.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "partial":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "unpaid":
      default:
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getMethodBadgeStyle = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "cheque":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "online":
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  return (
    <div className="space-y-6 mt-4 p-1">
      {/* Payment Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Amount Box */}
        <div className="bg-[#F7F6F2] rounded-2xl p-5 border border-stone-100 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Total Amount</span>
          <span className="text-2xl font-bold text-[#2d2d2d] mt-2">
            {currencyFormatter.format(finalAmount)}
          </span>
        </div>

        {/* Amount Paid Box */}
        <div className="bg-[#F7F6F2] rounded-2xl p-5 border border-stone-100 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Amount Paid</span>
          <span className="text-2xl font-bold text-[#2d2d2d] mt-2">
            {currencyFormatter.format(amountPaid)}
          </span>
        </div>

        {/* Remaining Balance Box */}
        <div className="bg-[#F7F6F2] rounded-2xl p-5 border border-stone-100 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Remaining Balance</span>
            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(balancePaymentStatus)}`}>
              {balancePaymentStatus}
            </span>
          </div>
          <span className="text-2xl font-bold text-[#2d2d2d] mt-2">
            {currencyFormatter.format(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Pay Online Action Section */}
      {remainingAmount > 0 && balancePaymentStatus !== "paid" && (
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-[#2d2d2d] flex items-center gap-2">
              <CreditCard size={18} className="text-[#5C614D]" />
              Pay Remaining Balance
            </h3>
            <p className="text-xs text-stone-500">
              Complete the outstanding payment of {currencyFormatter.format(remainingAmount)} online.
            </p>
          </div>
          <button
            onClick={handlePayOnline}
            disabled={loading}
            className="bg-[#5C614D] hover:bg-[#4d5140] disabled:bg-stone-300 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Pay Remaining {currencyFormatter.format(remainingAmount)} Online</span>
            )}
          </button>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="space-y-3">
        <h4 className="font-serif text-base font-bold text-[#2d2d2d] flex items-center gap-2">
          <Receipt size={18} className="text-[#5C614D]" />
          Payment Transactions Log
        </h4>

        {transactionsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-[#F7F6F2] rounded-2xl p-4 border border-stone-100 flex items-center justify-between">
                <div className="space-y-2 w-1/3">
                  <div className="h-3.5 bg-stone-200 rounded w-24" />
                  <div className="h-3 bg-stone-200 rounded w-16" />
                </div>
                <div className="h-5 bg-stone-200 rounded w-20" />
                <div className="h-4 bg-stone-200 rounded w-24" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-sm text-stone-500 bg-[#F7F6F2] rounded-2xl border border-dashed border-stone-200">
            No transactions recorded yet
          </div>
        ) : (
          <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F7F6F2] border-b border-stone-100 text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Logged By</th>
                    <th className="py-3 px-4">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-stone-50/40 text-stone-600">
                      <td className="py-3.5 px-4 font-medium text-xs whitespace-nowrap">
                        {format(new Date(txn.paidAt), "dd MMM yyyy, hh:mm a")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#2d2d2d] whitespace-nowrap">
                        {currencyFormatter.format(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getMethodBadgeStyle(txn.method)}`}>
                          {txn.method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">
                        {txn.loggedBy === "user" ? "You" : "Vendor"}
                      </td>
                      <td className="py-3.5 px-4 text-xs italic text-stone-500">
                        {txn.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
