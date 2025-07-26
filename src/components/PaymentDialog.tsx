
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Check, Banknote, PiggyBank } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/store";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number, date: Date, type: 'principal' | 'interest', notes?: string) => void;
  loanAmount?: number;
}

const PaymentDialog = ({ open, onOpenChange, onSubmit, loanAmount }: PaymentDialogProps) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [paymentType, setPaymentType] = useState<'principal' | 'interest'>('interest');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }
    
    if (paymentType === 'principal' && loanAmount && amountValue > loanAmount) {
      newErrors.amount = `Principal payment cannot exceed the loan amount of ${formatCurrency(loanAmount)}`;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(amountValue, date, paymentType, notes || undefined);
      resetForm();
      onOpenChange(false);
    }
  };
  
  const resetForm = () => {
    setAmount("");
    setDate(new Date());
    setNotes("");
    setPaymentType('interest');
    setErrors({});
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-md animate-scale-in",
        isMobile ? "w-[95%] p-4" : ""
      )}>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Choose whether you're recording a principal or interest payment.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center h-20 sm:h-24 rounded-xl gap-2 transition-all",
                paymentType === 'principal' 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0" 
                  : "bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700"
              )}
              onClick={() => setPaymentType('principal')}
            >
              <PiggyBank size={isMobile ? 20 : 24} className={paymentType === 'principal' ? "text-white" : "text-blue-500"} />
              <span className="font-medium text-xs sm:text-sm">Principal</span>
            </Button>
            
            <Button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center h-20 sm:h-24 rounded-xl gap-2 transition-all",
                paymentType === 'interest' 
                  ? "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0" 
                  : "bg-white border-2 border-gray-200 hover:border-green-500 text-gray-700"
              )}
              onClick={() => setPaymentType('interest')}
            >
              <Banknote size={isMobile ? 20 : 24} className={paymentType === 'interest' ? "text-white" : "text-green-500"} />
              <span className="font-medium text-xs sm:text-sm">Interest</span>
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              {paymentType === 'principal' ? 'Principal Amount' : 'Interest Amount'} (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              )}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-lg border border-gray-300",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, isMobile ? "PP" : "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={isMobile ? 2 : 3}
              className="rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <DialogFooter className={cn("pt-2", isMobile ? "flex-col space-y-2" : "")}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className={cn(
                "rounded-lg border-gray-300",
                isMobile ? "w-full" : ""
              )}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className={cn(
                "rounded-lg",
                paymentType === 'principal' 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-green-600 hover:bg-green-700",
                isMobile ? "w-full" : ""
              )}
            >
              <Check size={16} className="mr-2" />
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
