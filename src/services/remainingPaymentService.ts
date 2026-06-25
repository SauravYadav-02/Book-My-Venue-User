import axios from "axios";

const BASE_URL = "http://192.168.1.12:3000";

// Helper to get auth headers matching other services (e.g. wishlistService.ts)
const getHeaders = () => {
  const userId = localStorage.getItem("userId");
  return {
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { userid: userId } : {}),
    },
  };
};

// POST /api/remaining-payment/user/pay-online/:bookingId
export const payRemainingOnline = async (
  bookingId: string
): Promise<{ success: boolean; booking: any }> => {
  const res = await axios.post(
    `${BASE_URL}/api/remaining-payment/user/pay-online/${bookingId}`,
    {},
    getHeaders()
  );
  return res.data;
};

// GET /api/remaining-payment/user/booking/:bookingId/transactions
export const getUserBookingTransactions = async (
  bookingId: string
): Promise<{ success: boolean; transactions: any[] }> => {
  const res = await axios.get(
    `${BASE_URL}/api/remaining-payment/user/booking/${bookingId}/transactions`,
    getHeaders()
  );
  return res.data;
};
