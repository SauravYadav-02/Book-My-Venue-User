import { useEffect, useState } from "react";
import { getUserTransactions } from "../../services/paymentService";
import { format } from "date-fns";
import { Receipt, CheckCircle, XCircle, Clock, Building2 } from "lucide-react";
import { currencyFormatter } from "../../utils/currency";

interface Transaction {
  _id: string;
  bookingId: string;
  userId: string;
  vendorId: { _id: string; name: string; businessName: string };
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

  useEffect(() => {
    const fetchTransactions = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId || userId === "undefined" || userId === "null") {
        window.location.href = "/login";
        return;
      }

      try {
        const data = await getUserTransactions(userId);
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
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
    <div className="min-h-screen pt-32 pb-20 bg-[#F7F6F2]">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-[#5C614D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#5C614D]">
            <Receipt size={32} />
          </div>
          <h1 className="text-3xl font-serif text-[#2d2d2d]">Transaction History</h1>
          <p className="text-gray-500 mt-2">View all your payments made to venues</p>
        </div>

        {transactions.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-bottom border-gray-100">
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Venue & Vendor</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
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
                              {tx.vendorId?.businessName || tx.vendorId?.name || "Vendor"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {tx.transactionId}
                        </span>
                      </td>
                      <td className="p-5">
                        <p className="text-sm font-bold text-[#2d2d2d]">
                          {currencyFormatter.format(tx.amount)}
                        </p>
                      </td>
                      <td className="p-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
                          tx.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                          tx.paymentStatus === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.paymentStatus === 'success' && <CheckCircle size={10} />}
                          {tx.paymentStatus === 'failed' && <XCircle size={10} />}
                          {tx.paymentStatus === 'cancelled' && <XCircle size={10} className="text-slate-500" />}
                          {tx.paymentStatus === 'pending' && <Clock size={10} />}
                          {tx.paymentStatus}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Receipt size={32} />
            </div>
            <h3 className="text-2xl font-serif text-[#2d2d2d] mb-2">No transactions found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven't made any payments yet. When you book a venue and complete the upfront payment, it will show up here.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
