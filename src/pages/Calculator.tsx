import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calculator, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/store";

const LoanCalculator = () => {
  const navigate = useNavigate();

  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(10000);
  const [payoffResults, setPayoffResults] = useState<{
    months: number;
    totalInterest: number;
    totalPayment: number;
    impossible?: boolean;
  } | null>(null);

  const [emiAmount, setEmiAmount] = useState<number>(100000);
  const [emiRate, setEmiRate] = useState<number>(10);
  const [emiMonths, setEmiMonths] = useState<number>(12);
  const [emiResults, setEmiResults] = useState<{
    emi: number;
    totalInterest: number;
    totalPayment: number;
  } | null>(null);

  const calculatePayoff = () => {
    if (!loanAmount || !interestRate || !monthlyPayment) return;
    const monthlyInterestRate = interestRate / 100 / 12;
    const minimumPayment = loanAmount * monthlyInterestRate;

    if (monthlyPayment <= minimumPayment) {
      setPayoffResults({ months: 0, totalInterest: 0, totalPayment: 0, impossible: true });
      return;
    }

    let balance = loanAmount;
    let months = 0;
    let totalInterest = 0;

    while (balance > 0 && months < 1000) {
      const interestForMonth = balance * monthlyInterestRate;
      totalInterest += interestForMonth;
      const principalPayment = Math.min(monthlyPayment - interestForMonth, balance);
      balance -= principalPayment;
      months++;
    }

    setPayoffResults({ months, totalInterest, totalPayment: loanAmount + totalInterest });
  };

  const calculateEMI = () => {
    if (!emiAmount || !emiMonths) return;
    const r = emiRate / 100 / 12;
    const n = emiMonths;
    let emi: number;
    if (r === 0) {
      emi = emiAmount / n;
    } else {
      emi = (emiAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    const totalPayment = emi * n;
    setEmiResults({ emi, totalInterest: totalPayment - emiAmount, totalPayment });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center h-14 px-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-base font-semibold mx-auto flex items-center gap-2">
            <Calculator size={16} />
            Calculator
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto pb-20">
        <Tabs defaultValue="payoff" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-11 rounded-xl bg-gray-100 dark:bg-gray-800/50">
            <TabsTrigger value="payoff" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">Payoff</TabsTrigger>
            <TabsTrigger value="emi" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">EMI</TabsTrigger>
          </TabsList>

          {/* Payoff */}
          <TabsContent value="payoff">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-5">
              <div>
                <h2 className="text-base font-semibold mb-0.5">Loan Payoff</h2>
                <p className="text-xs text-muted-foreground">Calculate time to pay off with fixed payments</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Loan Amount (₹)</Label>
                  <Input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} min={0} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Annual Interest Rate (%)</Label>
                  <Input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.01" min={0} className="h-11 rounded-xl" />
                  {loanAmount > 0 && interestRate > 0 && (
                    <p className="text-[11px] text-muted-foreground">Monthly interest: {formatCurrency(loanAmount * interestRate / 100 / 12)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Monthly Payment (₹)</Label>
                  <Input type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(Number(e.target.value))} min={0} className="h-11 rounded-xl" />
                </div>
                <Button onClick={calculatePayoff} className="w-full h-11 rounded-xl">Calculate</Button>
              </div>

              {payoffResults && (
                <div className="border-t pt-5 space-y-4">
                  {payoffResults.impossible ? (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <AlertTriangle size={16} className="mt-0.5 text-red-500 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-red-700 dark:text-red-300">Cannot pay off this loan</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                          Payment of {formatCurrency(monthlyPayment)} doesn't cover monthly interest of {formatCurrency(loanAmount * interestRate / 100 / 12)}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold">Results</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <ResultCard label="Time to pay off" value={payoffResults.months >= 12 ? `${Math.floor(payoffResults.months / 12)}y ${payoffResults.months % 12}m` : `${payoffResults.months} months`} />
                        <ResultCard label="Total Interest" value={formatCurrency(payoffResults.totalInterest)} />
                        <ResultCard label="Total Payment" value={formatCurrency(payoffResults.totalPayment)} />
                        <ResultCard label="Interest Cost" value={`${Math.round(payoffResults.totalInterest / loanAmount * 100)}%`} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* EMI */}
          <TabsContent value="emi">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-5">
              <div>
                <h2 className="text-base font-semibold mb-0.5">EMI Calculator</h2>
                <p className="text-xs text-muted-foreground">Calculate monthly installment for a fixed tenure</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Loan Amount (₹)</Label>
                  <Input type="number" value={emiAmount} onChange={(e) => setEmiAmount(Number(e.target.value))} min={0} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Annual Interest Rate (%)</Label>
                  <Input type="number" value={emiRate} onChange={(e) => setEmiRate(Number(e.target.value))} step="0.01" min={0} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Loan Tenure (Months)</Label>
                  <Input type="number" value={emiMonths} onChange={(e) => setEmiMonths(Number(e.target.value))} min={1} className="h-11 rounded-xl" />
                </div>
                <Button onClick={calculateEMI} className="w-full h-11 rounded-xl">Calculate EMI</Button>
              </div>

              {emiResults && (
                <div className="border-t pt-5 space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                    <p className="text-[11px] text-blue-500 uppercase tracking-wider font-medium mb-1">Monthly EMI</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(emiResults.emi)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ResultCard label="Total Interest" value={formatCurrency(emiResults.totalInterest)} />
                    <ResultCard label="Total Payment" value={formatCurrency(emiResults.totalPayment)} />
                    <ResultCard label="Interest Cost" value={`${emiAmount > 0 ? Math.round(emiResults.totalInterest / emiAmount * 100) : 0}%`} />
                    <ResultCard label="Tenure" value={emiMonths >= 12 ? `${Math.floor(emiMonths / 12)}y ${emiMonths % 12}m` : `${emiMonths} months`} />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const ResultCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-3">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
    <p className="text-base font-bold">{value}</p>
  </div>
);

export default LoanCalculator;
