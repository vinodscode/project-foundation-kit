import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatCurrency, useLoanStore } from "@/lib/store";
import { ArrowLeft, Edit, PlusCircle, Pencil, PiggyBank, Banknote, History, Clock } from "lucide-react";
import { format } from "date-fns";
import { Payment, EditRecord } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentDialog from "@/components/PaymentDialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const LoanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showEditHistory, setShowEditHistory] = useState(false);

  const loans = useLoanStore((state) => state.loans);
  const addPayment = useLoanStore((state) => state.addPayment);
  const updatePayment = useLoanStore((state) => state.updatePayment);
  const getTotalInterestReceived = useLoanStore((state) => state.getTotalInterestReceived);
  const getTotalPrincipalPaid = useLoanStore((state) => state.getTotalPrincipalPaid);
  const getRemainingPrincipal = useLoanStore((state) => state.getRemainingPrincipal);

  const loan = loans.find((loan) => loan.id === id);

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center px-4">
          <h1 className="text-xl font-semibold mb-2">Loan Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">This loan doesn't exist or was deleted.</p>
          <Button onClick={() => navigate("/")} className="rounded-xl">Go Home</Button>
        </div>
      </div>
    );
  }

  const totalInterest = getTotalInterestReceived(loan.id);
  const principalPaid = getTotalPrincipalPaid(loan.id);
  const remainingPrincipal = getRemainingPrincipal(loan.id);
  const repaymentPercent = loan.amount > 0 ? Math.min(100, Math.round((principalPaid / loan.amount) * 100)) : 0;
  const isCompleted = remainingPrincipal <= 0;

  const handlePaymentSubmit = async (amount: number, date: Date, type: 'principal' | 'interest', notes?: string) => {
    try {
      if (editingPayment) {
        await updatePayment(loan.id, editingPayment.id, { amount, date, type, notes });
        toast({
          title: "Payment updated",
          description: `${type === 'principal' ? 'Principal' : 'Interest'} payment updated to ${formatCurrency(amount)}.`,
        });
        setEditingPayment(null);
      } else {
        await addPayment(loan.id, { amount, date, notes, type });
        toast({
          title: "Payment recorded",
          description: `${type === 'principal' ? 'Principal' : 'Interest'} payment of ${formatCurrency(amount)} added.`,
        });
      }
    } catch {
      toast({ title: editingPayment ? "Failed to update" : "Failed to add payment", variant: "destructive" });
    }
  };

  const sortedPayments = [...loan.payments].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const monthlyInterest = remainingPrincipal * loan.interestRate / 100 / 12;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 px-4 pt-12 pb-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 active:bg-white/25 transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditHistory(true)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 active:bg-white/25 transition-colors"
            >
              <History size={16} className="text-white" />
              {loan.editHistory && loan.editHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-amber-400 text-[9px] font-bold text-gray-900 flex items-center justify-center px-1">
                  {loan.editHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate(`/loans/${loan.id}/edit`)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 active:bg-white/25 transition-colors"
            >
              <Edit size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Name + tags */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white leading-tight">{loan.borrowerName}</h1>
            {isCompleted && (
              <span className="text-[10px] font-semibold bg-green-400/20 text-green-200 border border-green-400/30 px-2 py-0.5 rounded-md">
                Paid off
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="text-[11px] font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-md">
              {loan.interestRate}% p.a.
            </span>
            <span className="text-[11px] text-blue-100 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
              {loan.loanType ?? 'Gold'}{loan.loanType === 'Gold' && loan.goldGrams ? ` · ${loan.goldGrams}g` : ''}
            </span>
            <span className="text-[11px] text-blue-200">
              {format(new Date(loan.startDate), "d MMM yyyy")}
            </span>
          </div>
        </div>

        {/* Key amounts */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] text-blue-200 uppercase tracking-wider mb-1">Outstanding</p>
            <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(remainingPrincipal)}</p>
          </div>
          <div className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] text-blue-200 uppercase tracking-wider mb-1">Original Loan</p>
            <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(loan.amount)}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-blue-200">Repaid {repaymentPercent}%</span>
            <span className="text-xs text-blue-300 tabular-nums">{formatCurrency(principalPaid)} of {formatCurrency(loan.amount)}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${repaymentPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mx-4 -mt-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 overflow-hidden">
        <div className="px-3 py-3.5 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Paid</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(principalPaid)}</p>
        </div>
        <div className="px-3 py-3.5 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Interest</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400 tabular-nums">{formatCurrency(totalInterest)}</p>
        </div>
        <div className="px-3 py-3.5 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Monthly</p>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {isCompleted ? '—' : formatCurrency(monthlyInterest)}
          </p>
        </div>
      </div>

      {/* Notes */}
      {loan.notes && (
        <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-700/50">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{loan.notes}</p>
        </div>
      )}

      {/* Payments */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Payments</h2>
            <p className="text-xs text-gray-400">{sortedPayments.length} record{sortedPayments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {sortedPayments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-12 text-center">
            <Banknote size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-1">No payments yet</p>
            <p className="text-xs text-gray-300 dark:text-gray-600">Tap the button below to add one</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPayments.map((payment: Payment) => (
              <div
                key={payment.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm press-scale"
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    payment.type === 'principal'
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "bg-green-50 dark:bg-green-900/30"
                  )}>
                    {payment.type === 'principal'
                      ? <PiggyBank size={18} className="text-blue-600 dark:text-blue-400" />
                      : <Banknote size={18} className="text-green-600 dark:text-green-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(payment.amount)}</p>
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                        payment.type === 'principal'
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      )}>
                        {payment.type === 'principal' ? 'Principal' : 'Interest'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(payment.date), "d MMM yyyy")}</p>
                      {payment.notes && (
                        <p className="text-[11px] text-gray-400 truncate">· {payment.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 active:text-blue-500 active:bg-blue-50 dark:active:bg-blue-900/20 transition-colors shrink-0"
                    onClick={() => { setEditingPayment(payment); setIsPaymentDialogOpen(true); }}
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
        <button
          onClick={() => { setEditingPayment(null); setIsPaymentDialogOpen(true); }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm py-3.5 rounded-2xl shadow-lg shadow-blue-600/25 transition-colors"
        >
          <PlusCircle size={18} />
          Add Payment
        </button>
      </div>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => { setIsPaymentDialogOpen(open); if (!open) setEditingPayment(null); }}
        onSubmit={handlePaymentSubmit}
        loanAmount={remainingPrincipal}
        editPayment={editingPayment}
      />

      {/* Edit History Dialog */}
      <Dialog open={showEditHistory} onOpenChange={setShowEditHistory}>
        <DialogContent className="rounded-2xl max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <History size={16} />
              Edit History — {loan.borrowerName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {(!loan.editHistory || loan.editHistory.length === 0) ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Clock size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">No edits yet</p>
                <p className="text-[11px] text-muted-foreground mt-1">Edit history will appear here once changes are made.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...loan.editHistory].reverse().map((record, idx) => (
                  <LoanEditHistoryCard key={idx} record={record} index={loan.editHistory!.length - idx} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LOAN_FIELD_LABELS: Record<string, string> = {
  borrowerName: 'Borrower Name',
  interestRate: 'Interest Rate',
  notes: 'Notes',
  loanType: 'Loan Type',
  goldGrams: 'Gold (grams)',
};

const LoanEditHistoryCard = ({ record, index }: { record: EditRecord; index: number }) => {
  const changeEntries = Object.entries(record.changes);
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Edit #{index}</span>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(record.editedAt), "dd MMM yyyy, hh:mm a")}
        </span>
      </div>
      <div className="space-y-1.5">
        {changeEntries.map(([field, { from, to }]) => (
          <div key={field} className="text-[11px]">
            <span className="font-medium text-gray-600 dark:text-gray-300">{LOAN_FIELD_LABELS[field] ?? field}:</span>
            <div className="flex items-center gap-1.5 mt-0.5 ml-2">
              <span className="line-through text-red-500/70 truncate max-w-[120px]">
                {field === 'interestRate' ? `${from}%` : String(from || '—')}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-green-600 dark:text-green-400 font-medium truncate max-w-[120px]">
                {field === 'interestRate' ? `${to}%` : String(to || '—')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanDetails;
