import axios from "axios";

const BASE_URL = "http://localhost:3000/api/notifications";

const getHeaders = () => {
  const userId = localStorage.getItem("userId");
  return {
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { userid: userId } : {}),
    },
  };
};

export interface Notification {
  _id: string;
  userId: string;
  type: "booking_cancelled" | "general";
  title: string;
  message: string;
  relatedBookingId?: string | null;
  relatedVenueId?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const res = await axios.get(`${BASE_URL}/user/${userId}`, getHeaders());
  return res.data;
};

export const markNotificationAsRead = async (id: string): Promise<{ message: string; notification: Notification }> => {
  const res = await axios.patch(`${BASE_URL}/${id}/read`, {}, getHeaders());
  return res.data;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<{ message: string }> => {
  const res = await axios.patch(`${BASE_URL}/user/${userId}/read-all`, {}, getHeaders());
  return res.data;
};
