import { useEffect, useState } from "react";
import { getUserBookings, type BookingResponse } from "../../services/bookingService";
import { getUserById } from "../../services/userService";
import type { UserProfile } from "../../types/user.types";
import { CalendarDays, MapPin, DollarSign, CheckCircle, XCircle } from "lucide-react";

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
                src={`http://localhost:3000/${user.profilePhoto}`}
                alt={user.name}
                className="w-full h-full object-cover"
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
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-3xl font-serif text-[#2d2d2d] mt-1">${bookingData?.totalSpent?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <h2 className="text-2xl font-serif text-[#2d2d2d] mb-6">Booking History</h2>
        
        {bookingData?.bookings && bookingData.bookings.length > 0 ? (
          <div className="space-y-4">
            {bookingData.bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg font-bold text-[#2d2d2d] mb-2">
                    {booking.venueId?.name || "Unknown Venue"}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={16} />
                      {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      {booking.venueId?.location || "Location not provided"}
                    </span>
                  </div>
                </div>
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                  <div className="text-xl font-serif font-semibold text-[#2d2d2d]">
                    ${booking.cost.toLocaleString()}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    booking.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status === 'approved' && <CheckCircle size={12} />}
                    {booking.status === 'rejected' && <XCircle size={12} />}
                    {booking.status}
                  </div>
                </div>
              </div>
            ))}
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
