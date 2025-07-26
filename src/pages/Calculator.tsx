
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/store";

const LoanCalculator = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(10000);
  const [results, setResults] = useState<{
    months: number;
    totalInterest: number;
    totalPayment: number;
  } | null>(null);

  const calculateLoan = () => {
    // Simple loan calculation - more accurate calculations could be implemented
    if (!loanAmount || !interestRate || !monthlyPayment) return;
    
    const monthlyInterestRate = interestRate / 100 / 12;
    let balance = loanAmount;
    let months = 0;
    let totalInterest = 0;
    
    while (balance > 0 && months < 1000) { // Prevent infinite loop
      const interestForMonth = balance * monthlyInterestRate;
      totalInterest += interestForMonth;
      
      const principalPayment = monthlyPayment > interestForMonth ? 
        Math.min(monthlyPayment - interestForMonth, balance) : 0;
      
      balance -= principalPayment;
      months++;
      
      if (principalPayment <= 0) break; // Can't pay off loan
    }
    
    setResults({
      months: months,
      totalInterest: totalInterest,
      totalPayment: loanAmount + totalInterest
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="py-4 px-4 border-b flex items-center">
        <button
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-medium mx-auto">Loan Calculator</h1>
        <div className="w-[72px]"></div>
      </header>
      
      <main className="page-container max-w-lg py-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator size={20} className="mr-2" />
              Loan Payment Calculator
            </CardTitle>
            <CardDescription>
              Calculate how long it will take to pay off a loan with fixed payments
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
              <Input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyPayment">Monthly Payment (₹)</Label>
              <Input
                id="monthlyPayment"
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(Number(e.target.value))}
              />
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={calculateLoan} 
                className="w-full"
              >
                Calculate
              </Button>
            </div>
          </CardContent>
          
          {results && (
            <CardFooter className="flex flex-col border-t">
              <div className="w-full py-4 space-y-4">
                <h3 className="text-lg font-medium">Payment Summary</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Time to pay off</p>
                    <p className="text-xl font-medium">
                      {results.months} {results.months === 1 ? 'Month' : 'Months'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="text-xl font-medium">{formatCurrency(results.totalInterest)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Payment</p>
                    <p className="text-xl font-medium">{formatCurrency(results.totalPayment)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cost of Interest</p>
                    <p className="text-xl font-medium">
                      {Math.round(results.totalInterest / loanAmount * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
};

export default LoanCalculator;
