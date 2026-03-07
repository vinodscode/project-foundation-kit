import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoanStore } from "@/lib/store";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

const EditLoan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center px-4">
          <h1 className="text-xl font-semibold mb-2">Loan Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">This loan doesn't exist or was deleted.</p>
          <Button onClick={() => navigate("/")} className="rounded-xl">Go Home</Button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!borrowerName.trim()) newErrors.borrowerName = "Name is required";
    const rateValue = parseFloat(interestRate);
    if (!interestRate || isNaN(rateValue) || rateValue < 0 || rateValue > 100) newErrors.interestRate = "Rate must be 0-100%";
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
      await updateLoan(loan.id, {
        borrowerName,
        interestRate: parseFloat(interestRate),
        notes: notes.trim() || undefined,
        loanType,
        goldGrams: loanType === 'Gold' ? parseFloat(goldGrams) : undefined,
      });
      toast({ title: "Loan updated", description: "Changes saved." });
      navigate(`/loans/${loan.id}`);
    } catch {
      toast({ title: "Failed to update", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLoan(loan.id);
      toast({ title: "Loan deleted", description: "Loan and payments removed." });
      navigate("/");
    } catch {
      toast({ title: "Failed to delete", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-base font-semibold">Edit Loan</h1>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors -mr-2"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto pb-20">
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="borrowerName" className="text-sm font-medium">Borrower's Name</Label>
              <Input
                id="borrowerName"
                placeholder="Enter name"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className={cn("h-11 rounded-xl", errors.borrowerName && "border-red-500")}
              />
              {errors.borrowerName && <p className="text-xs text-red-500">{errors.borrowerName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Loan Amount (₹)</Label>
              <Input
                type="number"
                value={loan.amount}
                disabled
                className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">Amount cannot be changed after creation</p>
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
                  placeholder="Enter weight"
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
                placeholder="Enter rate"
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

          <Button type="submit" className="w-full h-12 rounded-xl font-medium gap-2">
            <Check size={16} />
            Save Changes
          </Button>
        </form>
      </main>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the loan and all payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
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
