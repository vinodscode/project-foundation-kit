import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Check, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number, date: Date, notes?: string) => void;
}

const TopUpDialog = ({ open, onOpenChange, onSubmit }: TopUpDialogProps) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(amountValue, date, notes || undefined);
      setAmount("");
      setDate(new Date());
      setNotes("");
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md animate-scale-in", isMobile ? "w-[95%] p-4" : "") }>
        <DialogHeader>
          <DialogTitle>Add Top-up</DialogTitle>
          <DialogDescription>
            Increase the loan principal by recording a top-up amount.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Top-up Amount (₹)</Label>
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
            <Label htmlFor="date" className="text-sm font-medium">Top-up Date</Label>
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
                  onSelect={(d) => d && setDate(d)}
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

          <DialogFooter className={cn("pt-2", isMobile ? "flex-col space-y-2" : "") }>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={cn("rounded-lg border-gray-300", isMobile ? "w-full" : "")}
            >
              Cancel
            </Button>
            <Button type="submit" className={cn("rounded-lg bg-blue-600 hover:bg-blue-700", isMobile ? "w-full" : "") }>
              <Check size={16} className="mr-2" />
              Save Top-up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpDialog;
