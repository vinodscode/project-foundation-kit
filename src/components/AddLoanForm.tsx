import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useLoanStore } from "@/lib/store";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddLoanFormProps {
  className?: string;
}

const AddLoanForm = ({ className }: AddLoanFormProps) => {
  const navigate = useNavigate();
  const addLoan = useLoanStore((state) => state.addLoan);
  const { toast } = useToast();

  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [loanType, setLoanType] = useState<'Gold' | 'Bond'>('Gold');
  const [goldGrams, setGoldGrams] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!borrowerName.trim()) newErrors.borrowerName = "Borrower's name is required";
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) newErrors.amount = "Enter a valid amount";
    const rateValue = parseFloat(interestRate);
    if (!interestRate || isNaN(rateValue) || rateValue < 0 || rateValue > 100) newErrors.interestRate = "Rate must be 0-100%";
    if (!startDate) newErrors.startDate = "Select a start date";
    if (loanType === 'Gold') {
      const g = parseFloat(goldGrams);
      if (!goldGrams || isNaN(g) || g <= 0) newErrors.goldGrams = "Enter valid gold grams";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addLoan({
        borrowerName,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        startDate: startDate!,
        notes: notes.trim() || undefined,
        loanType,
        goldGrams: loanType === 'Gold' ? parseFloat(goldGrams) : undefined,
      });
      toast({ title: "Loan added", description: `Loan for ${borrowerName} created.` });
      navigate("/");
    } catch {
      toast({ title: "Failed to add loan", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5 animate-fade-in", className)}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="borrowerName" className="text-sm font-medium">Borrower's Name</Label>
          <Input
            id="borrowerName"
            placeholder="Enter borrower's name"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            className={cn("h-11 rounded-xl", errors.borrowerName && "border-red-500")}
          />
          {errors.borrowerName && <p className="text-xs text-red-500">{errors.borrowerName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-sm font-medium">Loan Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={cn("h-11 rounded-xl", errors.amount && "border-red-500")}
          />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
        </div>

        {/* Loan Type */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Loan Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['Gold', 'Bond'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLoanType(type)}
                className={cn(
                  "h-11 rounded-xl text-sm font-medium border-2 transition-all",
                  loanType === type
                    ? type === 'Gold'
                      ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500"
                      : "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loanType === 'Gold' && (
          <div className="space-y-1.5">
            <Label htmlFor="goldGrams" className="text-sm font-medium">Gold (grams)</Label>
            <Input
              id="goldGrams"
              type="number"
              placeholder="Enter weight in grams"
              value={goldGrams}
              onChange={(e) => setGoldGrams(e.target.value)}
              className={cn("h-11 rounded-xl", errors.goldGrams && "border-red-500")}
              step="0.01"
            />
            {errors.goldGrams && <p className="text-xs text-red-500">{errors.goldGrams}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="interestRate" className="text-sm font-medium">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            placeholder="Enter interest rate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className={cn("h-11 rounded-xl", errors.interestRate && "border-red-500")}
            step="0.01"
            min="0"
            max="100"
          />
          {errors.interestRate && <p className="text-xs text-red-500">{errors.interestRate}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Start Date</Label>
          <DatePicker
            date={startDate}
            onDateChange={setStartDate}
            placeholder="Select date"
            className={cn(errors.startDate && "border-red-500")}
          />
          {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 rounded-xl"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-12 rounded-xl font-medium gap-2">
          <Check size={16} />
          Save Loan
        </Button>
      </div>
    </form>
  );
};

export default AddLoanForm;
