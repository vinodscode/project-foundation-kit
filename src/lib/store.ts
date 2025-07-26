import { create } from 'zustand';
import { Loan, Payment } from './types';
import { supabase } from '@/integrations/supabase/client';

// Define the store type with the interfaces from types.ts
export type LoanStoreState = {
  loans: Loan[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  
  fetchLoans: () => Promise<void>;
  addLoan: (loan: Omit<Loan, 'id' | 'payments'>) => Promise<Loan>;
  updateLoan: (loanId: string, loanData: Partial<Loan>) => Promise<void>;
  deleteLoan: (loanId: string) => Promise<void>;
  addPayment: (loanId: string, payment: Omit<Payment, 'id'>) => Promise<void>;
  deletePayment: (loanId: string, paymentId: string) => Promise<void>;
  getLoanById: (loanId: string) => Loan | undefined;
  getTotalLent: () => number;
  getMonthlyInterest: () => number;
  getRemainingPrincipal: (loanId?: string) => number;
  getTotalInterestReceived: (loanId?: string) => number;
  getTotalPrincipalPaid: (loanId?: string) => number;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  getFilteredLoans: () => Loan[];
};

// Helper function to transform database loan to app loan format
const transformDbLoanToAppLoan = (dbLoan: any, payments: any[] = []): Loan => {
  return {
    id: dbLoan.id,
    borrowerName: dbLoan.borrower_name,
    amount: parseFloat(dbLoan.amount),
    interestRate: parseFloat(dbLoan.interest_rate),
    startDate: new Date(dbLoan.start_date),
    notes: dbLoan.notes,
    loanType: dbLoan.loan_type as 'Gold' | 'Bond',
    goldGrams: dbLoan.gold_grams ? parseFloat(dbLoan.gold_grams) : undefined,
    payments: payments.map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount),
      date: new Date(payment.payment_date),
      notes: payment.notes,
      type: payment.payment_type as 'principal' | 'interest'
    }))
  };
};

export const useLoanStore = create<LoanStoreState>((set, get) => ({
  loans: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  
  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch loans with their payments
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;

      // Fetch all payments for these loans
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Group payments by loan_id
      const paymentsByLoanId = (paymentsData || []).reduce((acc, payment) => {
        if (!acc[payment.loan_id]) {
          acc[payment.loan_id] = [];
        }
        acc[payment.loan_id].push(payment);
        return acc;
      }, {} as Record<string, any[]>);

      // Transform and combine the data
      const loans = (loansData || []).map(loan => 
        transformDbLoanToAppLoan(loan, paymentsByLoanId[loan.id] || [])
      );

      set({ loans, isLoading: false });
    } catch (error) {
      console.error('Error fetching loans:', error);
      set({ error: error as Error, isLoading: false });
    }
  },
  
  addLoan: async (loan) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert({
          borrower_name: loan.borrowerName,
          amount: loan.amount,
          interest_rate: loan.interestRate,
          start_date: loan.startDate.toISOString(),
          notes: loan.notes,
          loan_type: loan.loanType,
          gold_grams: loan.goldGrams
        })
        .select()
        .single();

      if (error) throw error;

      const newLoan = transformDbLoanToAppLoan(data);
      
      set((state) => ({
        loans: [...state.loans, newLoan],
        isLoading: false
      }));
      
      return newLoan;
    } catch (error) {
      console.error('Error adding loan:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  updateLoan: async (loanId, loanData) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: any = {};
      if (loanData.borrowerName !== undefined) updateData.borrower_name = loanData.borrowerName;
      if (loanData.amount !== undefined) updateData.amount = loanData.amount;
      if (loanData.interestRate !== undefined) updateData.interest_rate = loanData.interestRate;
      if (loanData.startDate !== undefined) updateData.start_date = loanData.startDate.toISOString();
      if (loanData.notes !== undefined) updateData.notes = loanData.notes;
      if (loanData.loanType !== undefined) updateData.loan_type = loanData.loanType;
      if (loanData.goldGrams !== undefined) updateData.gold_grams = loanData.goldGrams;

      const { error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', loanId);

      if (error) throw error;

      set((state) => ({
        loans: state.loans.map((loan) =>
          loan.id === loanId ? { ...loan, ...loanData } : loan
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating loan:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  deleteLoan: async (loanId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', loanId);

      if (error) throw error;

      set((state) => ({
        loans: state.loans.filter((loan) => loan.id !== loanId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting loan:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  addPayment: async (loanId, payment) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          loan_id: loanId,
          amount: payment.amount,
          payment_date: payment.date.toISOString(),
          notes: payment.notes,
          payment_type: payment.type
        })
        .select()
        .single();

      if (error) throw error;

      const newPayment: Payment = {
        id: data.id,
        amount: Number(data.amount),
        date: new Date(data.payment_date),
        notes: data.notes,
        type: data.payment_type as 'principal' | 'interest'
      };

      set((state) => ({
        loans: state.loans.map((loan) => {
          if (loan.id === loanId) {
            return {
              ...loan,
              payments: [...(loan.payments || []), newPayment],
            };
          }
          return loan;
        }),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding payment:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  deletePayment: async (loanId, paymentId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      set((state) => ({
        loans: state.loans.map((loan) => {
          if (loan.id === loanId) {
            return {
              ...loan,
              payments: loan.payments.filter(p => p.id !== paymentId)
            };
          }
          return loan;
        }),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting payment:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  getLoanById: (loanId) => {
    const { loans } = get();
    return loans.find((loan) => loan.id === loanId);
  },
  
  getTotalLent: () => {
    const { loans } = get();
    return loans.reduce((total, loan) => total + loan.amount, 0);
  },
  
  getMonthlyInterest: () => {
    const { loans } = get();
    return loans.reduce((total, loan) => {
      const monthlyInterestRate = loan.interestRate / 100 / 12;
      return total + (loan.amount * monthlyInterestRate);
    }, 0);
  },
  
  getRemainingPrincipal: (loanId) => {
    const { loans } = get();
    
    if (loanId) {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return 0;
      
      const principalPayments = loan.payments
        .filter(p => p.type === 'principal')
        .reduce((sum, p) => sum + p.amount, 0);
      
      return Math.max(0, loan.amount - principalPayments);
    }
    
    return loans.reduce((total, loan) => {
      const principalPayments = loan.payments
        .filter(p => p.type === 'principal')
        .reduce((sum, p) => sum + p.amount, 0);
      
      return total + Math.max(0, loan.amount - principalPayments);
    }, 0);
  },
  
  getTotalInterestReceived: (loanId) => {
    const { loans } = get();
    
    if (loanId) {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return 0;
      
      return loan.payments
        .filter(p => p.type === 'interest')
        .reduce((sum, p) => sum + p.amount, 0);
    }
    
    return loans.reduce((total, loan) => {
      const interestPayments = loan.payments
        .filter(p => p.type === 'interest')
        .reduce((sum, p) => sum + p.amount, 0);
      
      return total + interestPayments;
    }, 0);
  },
  
  getTotalPrincipalPaid: (loanId) => {
    const { loans } = get();
    
    if (loanId) {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return 0;
      
      return loan.payments
        .filter(p => p.type === 'principal')
        .reduce((sum, p) => sum + p.amount, 0);
    }
    
    return loans.reduce((total, loan) => {
      const principalPayments = loan.payments
        .filter(p => p.type === 'principal')
        .reduce((sum, p) => sum + p.amount, 0);
      
      return total + principalPayments;
    }, 0);
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  clearSearch: () => {
    set({ searchQuery: '' });
  },
  
  getFilteredLoans: () => {
    const { loans, searchQuery } = get();
    
    if (!searchQuery.trim()) {
      return loans;
    }
    
    const query = searchQuery.toLowerCase();
    return loans.filter((loan) => 
      loan.borrowerName.toLowerCase().includes(query) ||
      (loan.loanType || '').toLowerCase().includes(query) ||
      loan.amount.toString().includes(query)
    );
  },
}));

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};