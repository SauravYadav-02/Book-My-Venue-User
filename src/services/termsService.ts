import axios from "axios";

const BASE_URL = "http://192.168.1.12:3000/terms";

export interface TermsDocument {
  _id: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Fetch the currently active Terms & Conditions (public — no auth required) */
export const getActiveTerms = async (): Promise<TermsDocument> => {
  const res = await axios.get<{ success: boolean; terms: TermsDocument }>(
    `${BASE_URL}/active`
  );
  return res.data.terms;
};
