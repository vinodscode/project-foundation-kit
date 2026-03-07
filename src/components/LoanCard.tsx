import { formatCurrency, useLoanStore } from "@/lib/store";
import { Loan } from "@/lib/types";
import { ChevronRight, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LoanCardProps {
  loan: Loan;
  className?: string;
}

const loanTypeColors: Record<string, string> = {
  Gold: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  Bond: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
};

const LoanCard = ({ loan, className }: LoanCardProps) => {
  const navigate = useNavigate();
  const totalInterestReceived = useLoanStore(state => state.getTotalInterestReceived(loan.id));
  const getRemainingPrincipal = useLoanStore(state => state.getRemainingPrincipal);

  const remainingPrincipal = getRemainingPrincipal(loan.id);
  const principalPaid = loan.amount - remainingPrincipal;
  const repaymentPercent = loan.amount > 0 ? Math.min(100, Math.round((principalPaid / loan.amount) * 100)) : 0;
  const isCompleted = remainingPrincipal <= 0;

  const typeColor = loanTypeColors[loan.loanType ?? 'Gold'] ?? loanTypeColors['Gold'];

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-2xl overflow-hidden press-scale cursor-pointer shadow-sm hover:shadow-md transition-all",
        isCompleted && "opacity-70",
        className
      )}
      onClick={() => navigate(`/loans/${loan.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">{loan.borrowerName}</h3>
            {isCompleted && (
              <span className="shrink-0 text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-md">
                Paid
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-md">
              {loan.interestRate}% p.a.
            </span>
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md", typeColor)}>
              {loan.loanType ?? 'Gold'}{loan.loanType === 'Gold' && loan.goldGrams ? ` · ${loan.goldGrams}g` : ''}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/loans/${loan.id}/edit`); }}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
        >
          <Edit size={14} />
        </button>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        <div className="bg-blue-50/80 dark:bg-blue-900/15 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-blue-500 dark:text-blue-400 mb-0.5 font-medium">Outstanding</p>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200 tabular-nums">{formatCurrency(remainingPrincipal)}</p>
        </div>
        <div className="bg-amber-50/80 dark:bg-amber-900/15 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-amber-500 dark:text-amber-400 mb-0.5 font-medium">Int. Received</p>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200 tabular-nums">{formatCurrency(totalInterestReceived)}</p>
        </div>
      </div>

      {/* Progress */}
      {loan.amount > 0 && (
        <div className="px-4 pb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-gray-400 font-medium">Repayment</span>
            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{repaymentPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCompleted ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${repaymentPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
        <span className="text-xs text-gray-400">
          {loan.notes
            ? <span className="truncate max-w-[200px] inline-block">{loan.notes}</span>
            : 'Tap to view details'}
        </span>
        <ChevronRight size={14} className="text-gray-300 shrink-0" />
      </div>
    </div>
  );
};

export default LoanCard;
