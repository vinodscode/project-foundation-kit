import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLoanStore } from "@/lib/store";
import Header from "@/components/Header";
import MOIDashboard from "@/components/MOIDashboard";

const MOI = () => {
  const navigate = useNavigate();
  const getTotalGiven = useLoanStore((state) => state.getTotalGiven);
  const getTotalReceived = useLoanStore((state) => state.getTotalReceived);

  const totalGiven = getTotalGiven();
  const totalReceived = getTotalReceived();
  const moiNet = totalReceived - totalGiven;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 w-full">
      <Header
        totalAmount={totalGiven}
        monthlyInterest={totalReceived}
        totalInterestEarned={Math.abs(moiNet)}
        labels={{ first: 'Total Given', second: 'Total Received', third: moiNet >= 0 ? 'Net Credit' : 'Net Debit' }}
      />

      <main className="flex-1 pb-20 w-full">
        <div className="container mx-auto px-4 py-5 max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
            >
              <ArrowLeft size={16} className="text-gray-500" />
            </button>
            <div>
              <h1 className="text-base font-semibold">MOI Dashboard</h1>
              <p className="text-[11px] text-muted-foreground">Track money at family functions</p>
            </div>
          </div>

          <MOIDashboard />
        </div>
      </main>
    </div>
  );
};

export default MOI;
