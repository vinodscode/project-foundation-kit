import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, useLoanStore } from "@/lib/store";
import { Loan } from "@/lib/types";
import { ChevronRight, Edit, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LoanCardProps {
  loan: Loan;
  className?: string;
}

const LoanCard = ({ loan, className }: LoanCardProps) => {
  const navigate = useNavigate();
  const totalInterestReceived = useLoanStore(state => state.getTotalInterestReceived(loan.id));
  const getRemainingPrincipal = useLoanStore(state => state.getRemainingPrincipal);
  
  // Calculate the current loan amount (original amount - principal payments)
  const currentLoanAmount = getRemainingPrincipal(loan.id);
  
  // Color mapping for loan types
  const loanTypeColors = {
    Gold: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-100 dark:border-amber-800/50",
    Bond: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-800/50"
  };

  return (
    <Card className={cn(
      "overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700", 
      className
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium line-clamp-1">{loan.borrowerName}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30 px-1.5 py-0 text-[10px]">
                <span style={{fontWeight: 'normal'}}>{loan.interestRate}</span><span style={{fontWeight: 'normal'}}>%</span>&nbsp;<span style={{fontSize: '12px'}}><span style={{fontWeight: 'normal'}}>Interest</span></span>
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-1.5 py-0",
                  loanTypeColors[loan.loanType || 'Gold']
                )}
              >
                <span style={{fontWeight: 'normal'}}>{loan.loanType || 'Gold'}</span>
                {loan.loanType === 'Gold' && loan.goldGrams ? <span style={{fontWeight: 'normal'}}>&nbsp;({loan.goldGrams}g)</span> : ''}
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/loans/${loan.id}/edit`)}
            className="h-6 w-6 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
          >
            <Edit size={13} />
            <span className="sr-only">Edit loan</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="p-2 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
            <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
            <p className="text-sm font-medium font-mono text-blue-900 dark:text-blue-300">{formatCurrency(currentLoanAmount)}</p>
          </div>
          <div className="p-2 rounded-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/30">
            <p className="text-xs text-gray-600 dark:text-gray-400">Interest</p>
            <p className="text-sm font-medium font-mono text-amber-900 dark:text-amber-300">{formatCurrency(totalInterestReceived)}</p>
          </div>
        </div>
        
        {loan.notes && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{loan.notes}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-0">
        <Button 
          variant="ghost" 
          className="w-full justify-between text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 py-2 h-auto rounded-none text-xs"
          onClick={() => navigate(`/loans/${loan.id}`)}
        >
          <span className="flex items-center gap-1">
            <PlusCircle size={14} />
            <span>Add Payment</span>
          </span>
          <ChevronRight size={14} className="text-gray-400" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoanCard;
