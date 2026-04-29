import axios from "axios";

const BASE_URL = "http://localhost:3000/bookings";

export interface Booking {
  _id: string;
  userId: any;
  vendorId: any;
  venueId: any;
  date: string;
  cost: number;
  status: string;
  createdAt: string;
}

export interface BookingResponse {
  bookings: Booking[];
  totalSpent?: number;
  totalBookings?: number;
}

export const getBookedDatesForVenue = async (venueId: string): Promise<string[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/venue/${venueId}/booked-dates`);
    return res.data.bookedDates;
  } catch (error) {
    console.error("Failed to fetch booked dates", error);
    return [];
  }
};

export const createBooking = async (
  userId: string,
  vendorId: string,
  venueId: string,
  date: string,
  cost: number
): Promise<{ message: string; booking: Booking }> => {
  const res = await axios.post(`${BASE_URL}/`, {
    userId,
    vendorId,
    venueId,
    date,
    cost,
  });
  return res.data;
};

export const getUserBookings = async (userId: string): Promise<BookingResponse> => {
  const res = await axios.get(`${BASE_URL}/user/${userId}`);
  return res.data;
};

export const getVendorBookings = async (vendorId: string): Promise<BookingResponse> => {
  const res = await axios.get(`${BASE_URL}/vendor/${vendorId}`);
  return res.data;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "approved" | "rejected"
): Promise<any> => {
  const res = await axios.put(`${BASE_URL}/${bookingId}/status`, { status });
  return res.data;
};
