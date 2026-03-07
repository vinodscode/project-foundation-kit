import { Button } from "@/components/ui/button";
import { PlusCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-6">
        <Wallet size={32} className="text-blue-500" />
      </div>

      <h2 className="text-xl font-semibold mb-2 text-center">No loans yet</h2>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-[260px]">
        Start tracking your lending by adding your first loan entry.
      </p>

      <Button
        size="lg"
        className="rounded-2xl shadow-lg shadow-blue-600/20 gap-2 px-8 h-12"
        onClick={() => navigate("/add-loan")}
      >
        <PlusCircle size={18} />
        Add Your First Loan
      </Button>
    </div>
  );
};

export default EmptyState;
