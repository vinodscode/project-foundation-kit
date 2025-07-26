import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, useLoanStore } from "@/lib/store";
import { ArrowLeft, CalendarIcon, Edit, PlusCircle, Trash2, CreditCard, PiggyBank, Banknote } from "lucide-react";
import { format } from "date-fns";
import { Payment } from "@/lib/types";
import PaymentDialog from "@/components/PaymentDialog";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

const LoanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  
  const loans = useLoanStore((state) => state.loans);
  const addPayment = useLoanStore((state) => state.addPayment);
  const deletePayment = useLoanStore((state) => state.deletePayment);
  const getTotalInterestReceived = useLoanStore((state) => state.getTotalInterestReceived);
  const getTotalPrincipalPaid = useLoanStore((state) => state.getTotalPrincipalPaid);
  const getRemainingPrincipal = useLoanStore((state) => state.getRemainingPrincipal);
  
  const loan = loans.find((loan) => loan.id === id);
  
  const [loanDetails, setLoanDetails] = useState({
    totalInterest: 0,
    principalPaid: 0,
    remainingPrincipal: 0
  });
  
  useEffect(() => {
    if (loan?.id) {
      setLoanDetails({
        totalInterest: getTotalInterestReceived(loan.id),
        principalPaid: getTotalPrincipalPaid(loan.id),
        remainingPrincipal: getRemainingPrincipal(loan.id)
      });
    }
  }, [loan, loans, getTotalInterestReceived, getTotalPrincipalPaid, getRemainingPrincipal]);
  
  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-medium mb-2">Loan Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The loan you're looking for doesn't exist or was deleted.
          </p>
          <Button onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
      </div>
    );
  }
  
  const handleAddPayment = async (amount: number, date: Date, type: 'principal' | 'interest', notes?: string) => {
    try {
      await addPayment(loan.id, { amount, date, notes, type });
      
      setLoanDetails({
        totalInterest: type === 'interest' 
          ? loanDetails.totalInterest + amount 
          : loanDetails.totalInterest,
        principalPaid: type === 'principal' 
          ? loanDetails.principalPaid + amount 
          : loanDetails.principalPaid,
        remainingPrincipal: type === 'principal' 
          ? loanDetails.remainingPrincipal - amount 
          : loanDetails.remainingPrincipal
      });
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Failed to add payment",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const handleDeletePayment = async (paymentId: string) => {
    try {
      const paymentToRemove = loan.payments.find(p => p.id === paymentId);
      
      if (paymentToRemove) {
        await deletePayment(loan.id, paymentId);
        
        setLoanDetails({
          totalInterest: paymentToRemove.type === 'interest' 
            ? loanDetails.totalInterest - paymentToRemove.amount 
            : loanDetails.totalInterest,
          principalPaid: paymentToRemove.type === 'principal' 
            ? loanDetails.principalPaid - paymentToRemove.amount 
            : loanDetails.principalPaid,
          remainingPrincipal: paymentToRemove.type === 'principal' 
            ? loanDetails.remainingPrincipal + paymentToRemove.amount 
            : loanDetails.remainingPrincipal
        });
      }
      
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Failed to delete payment",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const sortedPayments = [...loan.payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const loanTypeColors = {
    Gold: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-100 dark:border-amber-800/50",
    Bond: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-800/50"
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
        <button
          className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-medium mx-auto">Loan Details</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/loans/${loan.id}/edit`)}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Edit size={18} />
          <span className="sr-only">Edit loan</span>
        </Button>
      </header>
      
      <main className="px-4 py-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-medium mr-2">{loan.borrowerName}</h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {loan.interestRate}% Interest
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      loanTypeColors[loan.loanType || 'Gold']
                    )}
                  >
                    {loan.loanType || 'Gold'}
                    {loan.loanType === 'Gold' && loan.goldGrams ? ` (${loan.goldGrams}g)` : ''}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Started on {format(new Date(loan.startDate), "PPP")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                Original Loan Amount: {formatCurrency(loan.amount)}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500 dark:text-gray-400">Original Loan Amount</p>
              <p className="text-lg font-medium font-mono">{formatCurrency(loan.amount)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className="text-blue-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Outstanding Principal</p>
              </div>
              <p className="text-base font-semibold">{formatCurrency(loanDetails.remainingPrincipal)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <PiggyBank size={16} className="text-blue-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Principal Paid</p>
                </div>
                <p className="text-base font-semibold">{formatCurrency(loanDetails.principalPaid)}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote size={16} className="text-green-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Interest Received</p>
                </div>
                <p className="text-base font-semibold">{formatCurrency(loanDetails.totalInterest)}</p>
              </div>
            </div>
          </div>
          
          {loan.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
              <p className="text-gray-700 dark:text-gray-300">{loan.notes}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Payments</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Record principal and interest payments
            </p>
          </div>
          <Button 
            onClick={() => setIsPaymentDialogOpen(true)} 
            className="gap-2"
            size={isMobile ? "sm" : "default"}
          >
            <PlusCircle size={isMobile ? 14 : 16} />
            <span>{isMobile ? "Add" : "Add Payment"}</span>
          </Button>
        </div>
        
        {sortedPayments.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No payments recorded yet</p>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(true)}
              className="gap-2"
            >
              <PlusCircle size={16} />
              <span>Record First Payment</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPayments.map((payment: Payment) => (
              <Card key={payment.id} className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <CardHeader className="py-2 px-3 flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs">
                      {format(new Date(payment.date), isMobile ? "PP" : "PPP")}
                    </span>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      payment.type === 'principal' 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    )}>
                      {payment.type === 'principal' ? 'Principal' : 'Interest'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    onClick={() => setPaymentToDelete(payment.id)}
                  >
                    <Trash2 size={14} />
                    <span className="sr-only">Delete payment</span>
                  </Button>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium font-mono">
                      {formatCurrency(payment.amount)}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[65%] text-right line-clamp-1">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSubmit={handleAddPayment}
        loanAmount={loanDetails.remainingPrincipal}
      />
      
      <AlertDialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => paymentToDelete && handleDeletePayment(paymentToDelete)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoanDetails;
