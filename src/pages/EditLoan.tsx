
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoanStore } from "@/lib/store";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Loan } from "@/lib/types";

const EditLoan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const loans = useLoanStore((state) => state.loans);
  const updateLoan = useLoanStore((state) => state.updateLoan);
  const deleteLoan = useLoanStore((state) => state.deleteLoan);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [borrowerName, setBorrowerName] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [notes, setNotes] = useState("");
  const [loanType, setLoanType] = useState<'Gold' | 'Bond'>('Gold');
  const [goldGrams, setGoldGrams] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const loan = loans.find((loan) => loan.id === id);
  
  useEffect(() => {
    if (loan) {
      setBorrowerName(loan.borrowerName);
      setInterestRate(loan.interestRate.toString());
      setNotes(loan.notes || "");
      setLoanType(loan.loanType || 'Gold');
      setGoldGrams(loan.goldGrams ? loan.goldGrams.toString() : "");
    }
  }, [loan]);
  
  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loan Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The loan you're looking for doesn't exist or was deleted.
          </p>
          <Button onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
      </div>
    );
  }
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!borrowerName.trim()) {
      newErrors.borrowerName = "Borrower's name is required";
    }
    
    const rateValue = parseFloat(interestRate);
    if (!interestRate || isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      newErrors.interestRate = "Interest rate must be between 0-100%";
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
    
    updateLoan(loan.id, {
      borrowerName,
      interestRate: parseFloat(interestRate),
      notes: notes.trim() || undefined,
      loanType,
      goldGrams: loanType === 'Gold' ? parseFloat(goldGrams) : undefined,
    });
    
    navigate(`/loans/${loan.id}`);
  };
  
  const handleDelete = () => {
    deleteLoan(loan.id);
    navigate("/");
  };
  
  return (
    <div className="min-h-screen">
      <header className="py-4 px-4 border-b flex items-center">
        <button
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-medium mx-auto">Edit Loan</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 size={18} />
          <span className="sr-only">Delete loan</span>
        </Button>
      </header>
      
      <main className="page-container max-w-md">
        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 animate-fade-in"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="borrowerName">Borrower's Name</Label>
              <Input
                id="borrowerName"
                placeholder="Enter borrower's name"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className={cn(errors.borrowerName ? "border-destructive" : "")}
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
                value={loan.amount}
                disabled
                className="bg-muted/50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Loan amount cannot be changed after creation
              </p>
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
                className={cn(errors.interestRate ? "border-destructive" : "")}
                step="0.01"
                min="0"
                max="100"
              />
              {errors.interestRate && (
                <p className="text-sm text-destructive">{errors.interestRate}</p>
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
          
          <Button type="submit" className="w-full">
            <Check size={16} className="mr-2" />
            Save Changes
          </Button>
        </form>
      </main>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this loan? This will remove all payment history
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditLoan;
