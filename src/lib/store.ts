import { create } from 'zustand';
import { Loan, Payment } from './types';
import { supabase } from '@/integrations/supabase/client';

// Define the store type with the interfaces from types.ts
export type SortOption = 'name' | 'amount' | 'date' | 'interest' | 'remaining';
export type FilterOption = {
  loanType: string[];
  amountRange: { min: number; max: number } | null;
};

export interface MOIEntry {
  id: string;
  amount: number;
  date: Date;
  name: string;
  description?: string;
}

export type LoanStoreState = {
  loans: Loan[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  filters: FilterOption;
  // MOI Mode
  moiMode: boolean;
  moiEntries: MOIEntry[];
  
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
  setSortBy: (sortBy: SortOption) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFilters: (filters: Partial<FilterOption>) => void;
  clearFilters: () => void;
  getFilteredLoans: () => Loan[];
  getActiveLoans: () => Loan[];
  getCompletedLoans: () => Loan[];
  // MOI Mode functions
  setMoiMode: (enabled: boolean) => void;
  addMoiEntry: (entry: Omit<MOIEntry, 'id'>) => void;
  deleteMoiEntry: (entryId: string) => void;
  getTotalMOI: () => number;
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

// Initialize MOI entries from localStorage
const initializeMOIEntries = (): MOIEntry[] => {
  try {
    const saved = localStorage.getItem('moiEntries');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
    }
  } catch (error) {
    console.error('Failed to load MOI entries from localStorage:', error);
  }
  return [];
};

export const useLoanStore = create<LoanStoreState>((set, get) => ({
  loans: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  sortBy: 'date' as SortOption,
  sortOrder: 'desc' as 'asc' | 'desc',
  filters: {
    loanType: [],
    amountRange: null,
  },
  // MOI Mode
  moiMode: false,
  moiEntries: initializeMOIEntries(),
  
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
          gold_grams: loan.goldGrams,
          user_id: (await supabase.auth.getUser()).data.user?.id
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
          payment_type: payment.type,
          user_id: (await supabase.auth.getUser()).data.user?.id
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
    return loans.reduce((total, loan) => {
      const remaining = get().getRemainingPrincipal(loan.id);
      return total + remaining;
    }, 0);
  },
  
  getMonthlyInterest: () => {
    const { loans } = get();
    return loans.reduce((total, loan) => {
      const remaining = get().getRemainingPrincipal(loan.id);
      if (remaining <= 0) return total; // Don't calculate interest for completed loans
      const monthlyInterestRate = loan.interestRate / 100 / 12;
      return total + (remaining * monthlyInterestRate);
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

  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        loanType: [],
        amountRange: null,
      }
    });
  },
  
  getFilteredLoans: () => {
    const { loans, searchQuery, sortBy, sortOrder, filters } = get();
    
    let filteredLoans = [...loans];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredLoans = filteredLoans.filter((loan) => 
        loan.borrowerName.toLowerCase().includes(query) ||
        (loan.loanType || '').toLowerCase().includes(query) ||
        loan.amount.toString().includes(query)
      );
    }
    
    // Apply loan type filter
    if (filters.loanType.length > 0) {
      filteredLoans = filteredLoans.filter((loan) => 
        filters.loanType.includes(loan.loanType || 'Other')
      );
    }
    
    // Apply amount range filter
    if (filters.amountRange) {
      filteredLoans = filteredLoans.filter((loan) => 
        loan.amount >= filters.amountRange!.min && 
        loan.amount <= filters.amountRange!.max
      );
    }
    
    // Apply sorting
    filteredLoans.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.borrowerName.localeCompare(b.borrowerName);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'date':
          comparison = a.startDate.getTime() - b.startDate.getTime();
          break;
        case 'interest':
          comparison = a.interestRate - b.interestRate;
          break;
        case 'remaining':
          const aRemaining = get().getRemainingPrincipal(a.id);
          const bRemaining = get().getRemainingPrincipal(b.id);
          comparison = aRemaining - bRemaining;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filteredLoans;
  },

  getActiveLoans: () => {
    const { loans } = get();
    return loans.filter(loan => get().getRemainingPrincipal(loan.id) > 0);
  },

  getCompletedLoans: () => {
    const { loans } = get();
    return loans.filter(loan => get().getRemainingPrincipal(loan.id) <= 0);
  },

  // MOI Mode functions
  setMoiMode: (enabled) => {
    set({ moiMode: enabled });
  },

  addMoiEntry: (entry) => {
    const newEntry: MOIEntry = {
      ...entry,
      id: crypto.randomUUID()
    };
    set((state) => {
      const updatedEntries = [...state.moiEntries, newEntry];
      // Persist to localStorage
      try {
        localStorage.setItem('moiEntries', JSON.stringify(updatedEntries.map(e => ({
          ...e,
          date: e.date.toISOString()
        }))));
      } catch (error) {
        console.error('Failed to save MOI entries to localStorage:', error);
      }
      return { moiEntries: updatedEntries };
    });
  },

  deleteMoiEntry: (entryId) => {
    set((state) => {
      const updatedEntries = state.moiEntries.filter(entry => entry.id !== entryId);
      // Persist to localStorage
      try {
        localStorage.setItem('moiEntries', JSON.stringify(updatedEntries.map(e => ({
          ...e,
          date: e.date.toISOString()
        }))));
      } catch (error) {
        console.error('Failed to save MOI entries to localStorage:', error);
      }
      return { moiEntries: updatedEntries };
    });
  },

  getTotalMOI: () => {
    const { moiEntries } = get();
    return moiEntries.reduce((total, entry) => total + entry.amount, 0);
  },
}));

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};
