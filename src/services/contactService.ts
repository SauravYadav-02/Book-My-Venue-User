import axios from "axios";

const BASE_URL = "http://192.168.1.12:3000/contacts";

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContacts {
  data: ContactMessage[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export const submitContactMessage = async (
  userId: string | null,
  data: ContactMessageInput
): Promise<{ message: string; contact: ContactMessage }> => {
  const res = await axios.post<{ message: string; contact: ContactMessage }>(
    BASE_URL,
    data,
    {
      headers: {
        ...(userId ? { userid: userId } : {}),
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

export const getContactMessages = async (
  adminId: string,
  page = 1,
  limit = 10,
  search = ""
): Promise<PaginatedContacts> => {
  const res = await axios.get<PaginatedContacts>(BASE_URL, {
    headers: {
      adminid: adminId,
    },
    params: {
      page,
      limit,
      search,
    },
  });
  return res.data;
};
