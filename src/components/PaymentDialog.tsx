import { useState, useEffect } from "react";
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
import { Payment } from "@/lib/types";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number, date: Date, type: 'principal' | 'interest', notes?: string) => void;
  loanAmount?: number;
  editPayment?: Payment | null;
}

const PaymentDialog = ({ open, onOpenChange, onSubmit, loanAmount, editPayment }: PaymentDialogProps) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [paymentType, setPaymentType] = useState<'principal' | 'interest'>('interest');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();

  useEffect(() => {
    if (editPayment) {
      setAmount(editPayment.amount.toString());
      setDate(new Date(editPayment.date));
      setNotes(editPayment.notes ?? "");
      setPaymentType(editPayment.type);
    } else {
      resetForm();
    }
  }, [editPayment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Enter a valid amount";
    }
    if (paymentType === 'principal' && loanAmount && amountValue > loanAmount) {
      newErrors.amount = `Cannot exceed ${formatCurrency(loanAmount)}`;
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

  const isEditing = !!editPayment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-md rounded-2xl",
        isMobile ? "w-[95%] p-5" : ""
      )}>
        <DialogHeader>
          <DialogTitle className="text-lg">{isEditing ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing ? 'Update payment details.' : 'Record a principal or interest payment.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center h-[72px] rounded-2xl gap-1.5 transition-all border-2",
                paymentType === 'principal'
                  ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-500"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-300"
              )}
              onClick={() => setPaymentType('principal')}
            >
              <PiggyBank size={20} className={paymentType === 'principal' ? "text-blue-500" : "text-gray-400"} />
              <span className="font-medium text-xs">Principal</span>
            </button>

            <button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center h-[72px] rounded-2xl gap-1.5 transition-all border-2",
                paymentType === 'interest'
                  ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-500"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-green-300"
              )}
              onClick={() => setPaymentType('interest')}
            >
              <Banknote size={20} className={paymentType === 'interest' ? "text-green-500" : "text-gray-400"} />
              <span className="font-medium text-xs">Interest</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {paymentType === 'principal' ? 'Principal' : 'Interest'} Amount (₹)
            </Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn("h-11 rounded-xl", errors.amount && "border-red-500")}
            />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal h-11 rounded-xl", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, isMobile ? "PP" : "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={isMobile ? 2 : 3}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className={cn("pt-1", isMobile ? "flex-col space-y-2" : "")}>
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); onOpenChange(false); }}
              className={cn("rounded-xl h-11", isMobile && "w-full")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                "rounded-xl h-11 gap-2",
                paymentType === 'principal' ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700",
                isMobile && "w-full"
              )}
            >
              <Check size={16} />
              {isEditing ? 'Update Payment' : 'Save Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
