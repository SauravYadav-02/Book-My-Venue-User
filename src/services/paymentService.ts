import axios from "axios";

const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.1.14:3000";

export interface PaymentBooking {
  _id: string;
  userId: string;
  vendorId: string;
  venueId: string;
  date: string;
  cost: number;
  totalBookingAmount: number;
  upfrontPaymentAmount: number;
  amountPaid: number;
  paymentStatus: "success" | "failed" | "cancelled";
  transactionId: string | null;
  paymentTimestamp: string | null;
  status: string;
  createdAt: string;
}

export interface CreateBookingPayload {
  userId: string;
  vendorId: string;
  venueId: string;
  date: string;
  bookingAmount: number; // treated as totalBookingAmount by backend
  selectedSlot?: string;
  basePrice?: number;
  slotMultiplier?: number;
  calculatedVenueAmount?: number;
  totalAmount?: number;
  selectedFoodType?: string;
  guestCount?: number;
  perPlatePrice?: number;
  foodTotal?: number;
  venueAmount?: number;
  finalAmount?: number;
}

export interface PayBookingPayload {
  bookingId: string;
  outcome?: "success" | "failure" | "cancelled";
}

export interface CreateBookingResponse {
  message: string;
  booking: PaymentBooking;
}

export interface PayBookingResponse {
  message: string;
  booking: PaymentBooking;
}

/**
 * Creates a booking via the mock payment route.
 * bookingAmount is sent as totalBookingAmount.
 */
export const createPaymentBooking = async (
  payload: CreateBookingPayload
): Promise<CreateBookingResponse> => {
  const res = await axios.post(`${BASE_URL}/create-booking`, payload);
  return res.data;
};

/**
 * Simulates payment for a booking.
 * If outcome is omitted, the backend randomly decides success/failure.
 */
export const simulatePayment = async (
  payload: PayBookingPayload
): Promise<PayBookingResponse> => {
  const res = await axios.post(`${BASE_URL}/pay`, payload);
  return res.data;
};

export const getUserTransactions = async (userId: string): Promise<any> => {
  const res = await axios.get(`${BASE_URL}/user/${userId}/payments`);
  return res.data.payments;
};