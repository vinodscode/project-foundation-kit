import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Loan, Payment } from './types';

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

const getLocalStorageLoans = (): Loan[] => {
  try {
    const loans = localStorage.getItem('loans');
    if (!loans) return [];

    const parsedLoans = JSON.parse(loans);

    // Convert string dates back to Date objects
    return parsedLoans.map((loan: any) => ({
      ...loan,
      startDate: new Date(loan.startDate),
      payments: loan.payments?.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date),
      })) || []
    }));
  } catch (error) {
    console.error("Error fetching loans from local storage:", error);
    return [];
  }
};

const setLocalStorageLoans = (loans: Loan[]) => {
  try {
    localStorage.setItem('loans', JSON.stringify(loans));
  } catch (error) {
    console.error("Error saving loans to local storage:", error);
  }
};

export const useLoanStore = create<LoanStoreState>((set, get) => ({
  loans: getLocalStorageLoans(),
  isLoading: false,
  error: null,
  searchQuery: '',
  
  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate fetching loans from an API
      const loans = getLocalStorageLoans();
      set({ loans: loans, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  addLoan: async (loan) => {
    return new Promise((resolve) => {
      const newLoan: Loan = {
        id: uuidv4(),
        ...loan,
        payments: [],
      };
      
      set((state) => {
        const updatedLoans = [...state.loans, newLoan];
        setLocalStorageLoans(updatedLoans);
        return { loans: updatedLoans };
      });
      
      resolve(newLoan);
    });
  },
  
  updateLoan: async (loanId, loanData) => {
    set((state) => {
      const updatedLoans = state.loans.map((loan) =>
        loan.id === loanId ? { ...loan, ...loanData } : loan
      );
      setLocalStorageLoans(updatedLoans);
      return { loans: updatedLoans };
    });
  },
  
  deleteLoan: async (loanId) => {
    set((state) => {
      const updatedLoans = state.loans.filter((loan) => loan.id !== loanId);
      setLocalStorageLoans(updatedLoans);
      return { loans: updatedLoans };
    });
  },
  
  addPayment: async (loanId, payment) => {
    set((state) => {
      const updatedLoans = state.loans.map((loan) => {
        if (loan.id === loanId) {
          const newPayment = { ...payment, id: uuidv4() };
          return {
            ...loan,
            payments: [...(loan.payments || []), newPayment],
          };
        }
        return loan;
      });
      setLocalStorageLoans(updatedLoans);
      return { loans: updatedLoans };
    });
  },
  
  deletePayment: async (loanId, paymentId) => {
    set((state) => {
      const updatedLoans = state.loans.map((loan) => {
        if (loan.id === loanId) {
          return {
            ...loan,
            payments: loan.payments.filter(p => p.id !== paymentId)
          };
        }
        return loan;
      });
      setLocalStorageLoans(updatedLoans);
      return { loans: updatedLoans };
    });
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
