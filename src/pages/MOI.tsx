import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import MOIDashboard from "@/components/MOIDashboard";
import { useLoanStore } from "@/lib/store";

const MOI = () => {
  const navigate = useNavigate();
  const getTotalLent = useLoanStore((state) => state.getTotalLent);
  const getMonthlyInterest = useLoanStore((state) => state.getMonthlyInterest);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 w-full">
      <Header 
        totalAmount={getTotalLent()}
        monthlyInterest={getMonthlyInterest()}
        totalInterestReceived={0}
        remainingPrincipal={0}
      />
      
      <main className="flex-1 pb-20 w-full">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lending Dashboard
            </Button>
          </div>
          <MOIDashboard />
        </div>
      </main>
    </div>
  );
};

export default MOI;