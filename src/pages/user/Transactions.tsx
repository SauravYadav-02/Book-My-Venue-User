import { useEffect, useState } from "react";
import { getUserTransactions } from "../../services/paymentService";
import { getUserBookings } from "../../services/bookingService";
import { RemainingPaymentPanel } from "../../components/user/RemainingPaymentPanel";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ReceiptIndianRupee, CheckCircle, XCircle, Clock, Building2, RotateCcw } from "lucide-react";
import { currencyFormatter } from "../../utils/currency";

interface Transaction {
  _id: string;
  bookingId: string;
  userId: string;
  vendorId: { _id: string; fullName?: string; name?: string; businessName: string };
  venueId: { _id: string; name: string };
  amount: number;
  paymentStatus: "pending" | "success" | "failed" | "cancelled";
  transactionId: string;
  paymentTimestamp: string;
  description: string;
  createdAt?: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  const getRemainingPayForBooking = (bookingId: string) => {
    const b = bookings.find((bk) => bk._id === bookingId);
    if (!b) return 0;
    const finalAmt = b.finalAmount || b.totalBookingAmount || b.cost || 0;
    const remainingAmt = b.remainingAmount !== undefined ? b.remainingAmount : (finalAmt - (b.amountPaid || 0));
    return remainingAmt;
  };

  const getBookingStatus = (bookingId: string) => {
    const b = bookings.find((bk) => bk._id === bookingId);
    return b ? b.status : "";
  };


  const getExpandedTransactions = () => {
    const list: any[] = [];
    transactions.forEach((tx) => {
      const isDbRefund = tx.description?.toLowerCase().includes("refund");
      if (isDbRefund) {
        list.push({
          ...tx,
          isRefund: true,
        });
        return;
      }

      const bStatus = getBookingStatus(tx.bookingId);
      if (bStatus === "cancelled") {
        list.push({
          ...tx,
          paymentStatus: "success",
          originalCancelled: true,
        });
      } else {
        list.push(tx);
      }
    });
    return list;
  };

  const handleRowClick = async (bookingId: string) => {
    if (!bookingId) return;
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const response = await getUserBookings(userId);
        const matched = response.bookings.find((b) => b._id === bookingId);
        if (matched) {
          const m = matched as any;
          if (m.status === "cancelled") {
            toast.error("This booking is cancelled and cannot accept further payments.");
            return;
          }
          setSelectedBooking({
            bookingId: matched._id,
            finalAmount: m.finalAmount || m.totalBookingAmount || m.cost || 0,
            amountPaid: m.amountPaid || 0,
            remainingAmount: m.remainingAmount !== undefined ? m.remainingAmount : ((m.finalAmount || m.totalBookingAmount || m.cost || 0) - (m.amountPaid || 0)),
            balancePaymentStatus: m.balancePaymentStatus || "unpaid",
          });
        } else {
          toast.error("Booking details not found.");
        }
      }
    } catch (error) {
      console.error("Error fetching booking details", error);
      toast.error("Failed to load booking details.");
    }
  };

  useEffect(() => {
    const fetchTransactionsAndBookings = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId || userId === "undefined" || userId === "null") {
        window.location.href = "/login";
        return;
      }

      try {
        const [txData, bookingRes] = await Promise.all([
          getUserTransactions(userId),
          getUserBookings(userId)
        ]);
        setTransactions(txData || []);
        setBookings(bookingRes.bookings || []);
      } catch (error) {
        console.error("Failed to fetch transactions and bookings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionsAndBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-[#F7F6F2] flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-32 pb-20 bg-[#F7F6F2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-[#5C614D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#5C614D]">
            <ReceiptIndianRupee size={32} />
          </div>
          <h1 className="text-3xl font-serif text-[#2d2d2d]">Transaction History</h1>
          <p className="text-gray-500 mt-2">View all your payments made to venues</p>
        </div>

        {transactions.length > 0 ? (
          <div className="md:bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-100 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Venue & Vendor</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount Paid</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Remaining Pay</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {getExpandedTransactions().map((tx) => {
                    const isRefund = tx.isRefund;
                    return (
                      <tr
                        key={tx._id}
                        onClick={() => handleRowClick(tx.bookingId)}
                        className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      >
                        <td className="p-5 whitespace-nowrap">
                          <p className="text-sm font-semibold text-[#2d2d2d]">
                            {format(new Date(tx.paymentTimestamp || tx.createdAt as any), 'dd MMM yyyy')}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {format(new Date(tx.paymentTimestamp || tx.createdAt as any), 'hh:mm a')}
                          </p>
                        </td>
                        <td className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#2d2d2d] leading-none">
                                {tx.venueId?.name || "Venue"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 font-medium">
                                {tx.vendorId?.businessName || tx.vendorId?.fullName || tx.vendorId?.name || "Vendor"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`text-xs font-mono px-2 py-1 rounded ${
                            isRefund ? "text-blue-600 bg-blue-50" : "text-gray-500 bg-gray-100"
                          }`}>
                            {isRefund ? (tx.paymentStatus === "pending" ? "REF-PENDING" : tx.transactionId || "REF-COMPLETED") : tx.transactionId}
                          </span>
                        </td>
                        <td className={`p-5 font-bold ${isRefund ? "text-blue-600" : "text-[#2d2d2d]"}`}>
                          {isRefund ? "-" : ""}{currencyFormatter.format(tx.amount)}
                        </td>
                        <td className="p-5 font-bold text-amber-700">
                          {isRefund ? "—" : currencyFormatter.format(getRemainingPayForBooking(tx.bookingId))}
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col items-start gap-1">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isRefund 
                                ? (tx.paymentStatus === "pending" 
                                    ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                    : "bg-blue-50 text-blue-700 border border-blue-200")
                                : (tx.paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
                                   tx.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                   tx.paymentStatus === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                                   'bg-yellow-100 text-yellow-700')
                            }`}>
                              {(isRefund && tx.paymentStatus === "pending") && <Clock size={10} />}
                              {(isRefund && tx.paymentStatus === "success") && <RotateCcw size={10} />}
                              {(!isRefund && tx.paymentStatus === 'success') && <CheckCircle size={10} />}
                              {tx.paymentStatus === 'failed' && <XCircle size={10} />}
                              {tx.paymentStatus === 'cancelled' && <XCircle size={10} className="text-slate-500" />}
                              {(!isRefund && tx.paymentStatus === 'pending') && <Clock size={10} />}
                              {isRefund 
                                ? (tx.paymentStatus === "pending" ? "refund pending" : "refunded") 
                                : tx.paymentStatus}
                            </div>
                            {isRefund && (
                              <span className="text-[10px] text-blue-600 font-semibold italic mt-0.5 max-w-[150px] truncate" title={tx.description}>
                                {tx.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5">
                          {isRefund ? (
                            <span className={`text-[10px] font-bold uppercase border px-2.5 py-1 rounded-full whitespace-nowrap ${
                              tx.paymentStatus === "pending" 
                                ? "text-amber-700 bg-amber-50 border-amber-200" 
                                : "text-blue-700 bg-blue-50 border border-blue-200"
                            }`}>
                              {tx.paymentStatus === "pending" ? "Refund Pending" : "Refunded"}
                            </span>
                          ) : tx.originalCancelled ? (
                            <span className="text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                              Paid (Upfront)
                            </span>
                          ) : getRemainingPayForBooking(tx.bookingId) > 0 ? (
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(tx.bookingId);
                              }}
                              className="bg-[#5C614D] hover:bg-[#4d5140] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
                            >
                              Pay
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                              Fully Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden space-y-4">
              {getExpandedTransactions().map((tx) => {
                const isRefund = tx.isRefund;
                const remainingPay = getRemainingPayForBooking(tx.bookingId);
                return (
                  <div
                    key={tx._id}
                    onClick={() => handleRowClick(tx.bookingId)}
                    className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col gap-4 active:bg-gray-50 transition-colors"
                  >
                    {/* Header: Date + Status */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 font-medium">
                        {format(new Date(tx.paymentTimestamp || tx.createdAt as any), 'dd MMM yyyy, hh:mm a')}
                      </div>
                      
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isRefund 
                          ? (tx.paymentStatus === "pending" 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200")
                          : (tx.paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
                             tx.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                             tx.paymentStatus === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                             'bg-yellow-100 text-yellow-700')
                      }`}>
                        {isRefund 
                          ? (tx.paymentStatus === "pending" ? "refund pending" : "refunded") 
                          : tx.paymentStatus}
                      </div>
                    </div>

                    {/* Venue & Vendor Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                        <Building2 size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[#2d2d2d] truncate">
                          {tx.venueId?.name || "Venue"}
                        </h4>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {tx.vendorId?.businessName || tx.vendorId?.fullName || tx.vendorId?.name || "Vendor"}
                        </p>
                      </div>
                    </div>

                    {/* Transaction ID */}
                    <div className="flex justify-between items-center text-xs border-t border-b border-gray-50 py-2.5">
                      <span className="text-gray-400 font-medium">Transaction ID</span>
                      <span className={`font-mono px-2 py-0.5 rounded text-[10px] truncate max-w-[140px] sm:max-w-none ${
                        isRefund ? "text-blue-600 bg-blue-50" : "text-gray-500 bg-gray-100"
                      }`} title={tx.transactionId}>
                        {isRefund ? (tx.paymentStatus === "pending" ? "REF-PENDING" : tx.transactionId || "REF-COMPLETED") : tx.transactionId}
                      </span>
                    </div>

                    {/* Amount & Remaining & Action */}
                    <div className="border-t border-gray-50 pt-3 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">Paid Amount</span>
                        <span className={`font-bold ${isRefund ? "text-blue-600" : "text-[#2d2d2d]"}`}>
                          {isRefund ? "-" : ""}{currencyFormatter.format(tx.amount)}
                        </span>
                      </div>
                      {!isRefund && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 font-medium">Remaining Amount</span>
                          <span className="font-bold text-amber-700">
                            {currencyFormatter.format(remainingPay)}
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-1">
                        {isRefund ? (
                          <span className={`block text-center text-[10px] font-bold uppercase border px-2.5 py-1.5 rounded-full ${
                            tx.paymentStatus === "pending" 
                              ? "text-amber-700 bg-amber-50 border-amber-200" 
                              : "text-blue-700 bg-blue-50 border border-blue-200"
                          }`}>
                            {tx.paymentStatus === "pending" ? "Refund Pending" : "Refunded"}
                          </span>
                        ) : tx.originalCancelled ? (
                          <span className="block text-center text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-full">
                            Paid (Upfront)
                          </span>
                        ) : remainingPay > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(tx.bookingId);
                            }}
                            className="w-full bg-[#5C614D] hover:bg-[#4d5140] text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
                          >
                            Pay Remaining ({currencyFormatter.format(remainingPay)})
                          </button>
                        ) : (
                          <span className="block text-center text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-full">
                            Fully Paid
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <ReceiptIndianRupee size={32} />
            </div>
            <h3 className="text-2xl font-serif text-[#2d2d2d] mb-2">No transactions found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven't made any payments yet. When you book a venue and complete the upfront payment, it will show up here.
            </p>
          </div>
        )}

      </div>

      {/* Booking Detail Modal for User */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 flex flex-col text-left">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-serif text-lg font-bold text-[#2d2d2d]">Remaining Payment Detail</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-lg"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <RemainingPaymentPanel
                booking={selectedBooking}
                onSuccess={async () => {
                  await handleRowClick(selectedBooking.bookingId);
                  const userId = localStorage.getItem("userId");
                  if (userId) {
                    try {
                      const [txData, bookingRes] = await Promise.all([
                        getUserTransactions(userId),
                        getUserBookings(userId)
                      ]);
                      setTransactions(txData || []);
                      setBookings(bookingRes.bookings || []);
                    } catch (error) {
                      console.error("Failed to refresh transactions and bookings", error);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
