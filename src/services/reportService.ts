import axios from "axios";

const BASE_URL = "http://localhost:3000/reports";

export interface Report {
  _id: string;
  title: string;
  description: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  venue: {
    _id: string;
    name: string;
    city: string;
    vendorId?: {
      _id: string;
      fullName: string;
      businessName: string;
      email: string;
    };
  };
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// 1. Submit a report (using FormData for attachments)
export const submitReport = async (userId: string, formData: FormData): Promise<Report> => {
  const res = await axios.post<{ message: string; report: Report }>(BASE_URL, formData, {
    headers: {
      userid: userId,
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data.report;
};

// 2. Fetch all reports of this user
export const getMyReports = async (userId: string): Promise<Report[]> => {
  const res = await axios.get<Report[]>(BASE_URL, {
    headers: { userid: userId }
  });
  return res.data;
};

// 3. Fetch single report details
export const getReportById = async (userId: string, reportId: string): Promise<Report> => {
  const res = await axios.get<Report>(`${BASE_URL}/${reportId}`, {
    headers: { userid: userId }
  });
  return res.data;
};
