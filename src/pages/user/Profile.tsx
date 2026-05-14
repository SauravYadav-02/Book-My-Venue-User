import { useEffect, useState } from "react";
import { getUserBookings, type BookingResponse } from "../../services/bookingService";
import { getUserById } from "../../services/userService";
import type { UserProfile } from "../../types/user.types";
import { format } from "date-fns";
import { CalendarDays, MapPin, CheckCircle, XCircle } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookingData, setBookingData] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
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
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F7F6F2] shadow-inner">
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
          </div>
        </div>

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
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {paymentStatus === 'success' && <CheckCircle size={12} />}
                        {paymentStatus === 'failed' && <XCircle size={12} />}
                        {paymentStatus === 'pending' ? 'Payment Pending' : paymentStatus === 'success' ? 'Paid' : 'Failed'}
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
