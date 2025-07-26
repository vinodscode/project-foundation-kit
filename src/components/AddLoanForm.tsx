import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useLoanStore } from "@/lib/store";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddLoanFormProps {
  className?: string;
}

const AddLoanForm = ({ className }: AddLoanFormProps) => {
  const navigate = useNavigate();
  const addLoan = useLoanStore((state) => state.addLoan);
  
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
    
    if (!borrowerName.trim()) {
      newErrors.borrowerName = "Borrower's name is required";
    }
    
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }
    
    const rateValue = parseFloat(interestRate);
    if (!interestRate || isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      newErrors.interestRate = "Interest rate must be between 0-100%";
    }
    
    if (!startDate) {
      newErrors.startDate = "Please select a start date";
    }

    if (loanType === 'Gold') {
      const goldGramsValue = parseFloat(goldGrams);
      if (!goldGrams || isNaN(goldGramsValue) || goldGramsValue <= 0) {
        newErrors.goldGrams = "Please enter valid gold grams greater than 0";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    addLoan({
      borrowerName,
      amount: parseFloat(amount),
      interestRate: parseFloat(interestRate),
      startDate: startDate!,
      notes: notes.trim() || undefined,
      loanType,
      goldGrams: loanType === 'Gold' ? parseFloat(goldGrams) : undefined,
    });
    
    navigate("/");
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("space-y-6 animate-fade-in", className)}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="borrowerName">Borrower's Name</Label>
          <Input
            id="borrowerName"
            placeholder="Enter borrower's name"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            className={errors.borrowerName ? "border-destructive" : ""}
          />
          {errors.borrowerName && (
            <p className="text-sm text-destructive">{errors.borrowerName}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Loan Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={errors.amount ? "border-destructive" : ""}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="loanType">Loan Type</Label>
          <RadioGroup
            value={loanType}
            onValueChange={(value) => setLoanType(value as 'Gold' | 'Bond')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Gold" id="gold" />
              <Label htmlFor="gold">Gold</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Bond" id="bond" />
              <Label htmlFor="bond">Bond</Label>
            </div>
          </RadioGroup>
        </div>
        
        {loanType === 'Gold' && (
          <div className="space-y-2">
            <Label htmlFor="goldGrams">Gold (in grams)</Label>
            <Input
              id="goldGrams"
              type="number"
              placeholder="Enter gold weight in grams"
              value={goldGrams}
              onChange={(e) => setGoldGrams(e.target.value)}
              className={errors.goldGrams ? "border-destructive" : ""}
              step="0.01"
            />
            {errors.goldGrams && (
              <p className="text-sm text-destructive">{errors.goldGrams}</p>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            placeholder="Enter interest rate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className={errors.interestRate ? "border-destructive" : ""}
            step="0.01"
            min="0"
            max="100"
          />
          {errors.interestRate && (
            <p className="text-sm text-destructive">{errors.interestRate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <DatePicker
            date={startDate}
            onDateChange={setStartDate}
            placeholder="Select loan start date"
            className={errors.startDate ? "border-destructive" : ""}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Check size={16} className="mr-2" />
          Save Loan
        </Button>
      </div>
    </form>
  );
};

export default AddLoanForm;
