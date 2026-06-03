import axios from "axios";

const BASE_URL = "http://localhost:3000/complaints";

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  vendor?: {
    _id: string;
    fullName: string;
    businessName: string;
    email: string;
  };
  venue?: {
    _id: string;
    name: string;
    city: string;
  };
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintMessage {
  _id: string;
  complaintId: string;
  senderId: string;
  senderModel: "User" | "Vendor" | "Admin";
  senderName: string;
  message: string;
  createdAt: string;
}

// 1. Submit a complaint (Supports optional file uploads using FormData)
export const submitComplaint = async (userId: string, formData: FormData): Promise<Complaint> => {
  const res = await axios.post<{ message: string; complaint: Complaint }>(BASE_URL, formData, {
    headers: {
      userid: userId,
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data.complaint;
};

// 2. Fetch all user complaints
export const getMyComplaints = async (userId: string): Promise<Complaint[]> => {
  const res = await axios.get<Complaint[]>(BASE_URL, {
    headers: { userid: userId }
  });
  return res.data;
};

// 3. Get single complaint details
export const getComplaintById = async (userId: string, complaintId: string): Promise<Complaint> => {
  const res = await axios.get<Complaint>(`${BASE_URL}/${complaintId}`, {
    headers: { userid: userId }
  });
  return res.data;
};

// 4. Retrieve message thread for a complaint
export const getComplaintMessages = async (userId: string, complaintId: string): Promise<ComplaintMessage[]> => {
  const res = await axios.get<ComplaintMessage[]>(`${BASE_URL}/${complaintId}/messages`, {
    headers: { userid: userId }
  });
  return res.data;
};

// 5. Send message to the complaint thread
export const sendComplaintMessage = async (userId: string, complaintId: string, message: string): Promise<ComplaintMessage> => {
  const res = await axios.post<ComplaintMessage>(`${BASE_URL}/${complaintId}/messages`, { message }, {
    headers: { userid: userId }
  });
  return res.data;
};
