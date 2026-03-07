
export interface Payment {
  id: string;
  amount: number;
  date: Date;
  notes?: string;
  type: 'principal' | 'interest';
}

export interface EditRecord {
  editedAt: string;
  changes: Record<string, { from: string | number; to: string | number }>;
}

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  startDate: Date;
  notes?: string;
  payments: Payment[];
  loanType?: 'Gold' | 'Bond';
  goldGrams?: number;
  editHistory?: EditRecord[];
}
