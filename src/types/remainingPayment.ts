export interface Transaction {
  _id: string;
  amount: number;
  method: "cash" | "cheque" | "online";
  loggedBy: "user" | "vendor";
  note?: string;
  paidAt: string;
}

export interface RemainingPaymentSummary {
  totalAmount: number;       // finalAmount
  amountPaid: number;
  remainingAmount: number;
  balancePaymentStatus: "unpaid" | "partial" | "paid";
  transactions: Transaction[];
}

export interface LogPaymentPayload {
  amount: number;
  method: "cash" | "cheque";
  note?: string;
}
