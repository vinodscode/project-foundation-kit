import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, RefreshCw, AlertCircle, Landmark, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import LoanCard from "@/components/LoanCard";
import MOIDashboard from "@/components/MOIDashboard";

import { useLoanStore, formatCurrency } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBox from "@/components/SearchBox";
import LoanFilters from "@/components/LoanFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mainTab, setMainTab] = useState<'loans' | 'moi'>('loans');

  const loans = useLoanStore((state) => state.loans);
  const isLoading = useLoanStore((state) => state.isLoading);
  const error = useLoanStore((state) => state.error);
  const searchQuery = useLoanStore((state) => state.searchQuery);
  const fetchLoans = useLoanStore((state) => state.fetchLoans);
  const getTotalLent = useLoanStore((state) => state.getTotalLent);
  const getMonthlyInterest = useLoanStore((state) => state.getMonthlyInterest);
  const getTotalInterestReceived = useLoanStore((state) => state.getTotalInterestReceived);
  const getFilteredLoans = useLoanStore((state) => state.getFilteredLoans);
  const getRemainingPrincipal = useLoanStore((state) => state.getRemainingPrincipal);
  const getTotalGiven = useLoanStore((state) => state.getTotalGiven);
  const getTotalReceived = useLoanStore((state) => state.getTotalReceived);
  const fetchMoiTransactions = useLoanStore((state) => state.fetchMoiTransactions);
  const moiTransactions = useLoanStore((state) => state.moiTransactions);

  useEffect(() => {
    fetchLoans().catch(err => console.error("Error fetching loans:", err));
    fetchMoiTransactions().catch(err => console.error("Error fetching MOI:", err));
  }, [fetchLoans, fetchMoiTransactions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchLoans();
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (err) {
      console.error("Error refreshing:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && loans.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 animate-pulse" />
        <div className="px-4 pt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const filteredLoans = getFilteredLoans();
  const activeLoans = filteredLoans.filter(loan => getRemainingPrincipal(loan.id) > 0);
  const completedLoans = filteredLoans.filter(loan => getRemainingPrincipal(loan.id) <= 0);

  const totalGiven = getTotalGiven();
  const totalReceived = getTotalReceived();
  const moiNet = totalReceived - totalGiven;

  const headerProps = mainTab === 'loans'
    ? {
        totalAmount: getTotalLent(),
        monthlyInterest: getMonthlyInterest(),
        totalInterestEarned: getTotalInterestReceived(),
      }
    : {
        totalAmount: totalGiven,
        monthlyInterest: totalReceived,
        totalInterestEarned: Math.abs(moiNet),
      };

  const headerLabels = mainTab === 'loans'
    ? undefined
    : { first: 'Total Given', second: 'Total Received', third: moiNet >= 0 ? 'Net Credit' : 'Net Debit' };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 w-full">
      <Header
        totalAmount={headerProps.totalAmount}
        monthlyInterest={headerProps.monthlyInterest}
        totalInterestEarned={headerProps.totalInterestEarned}
        labels={headerLabels}
      />

      <main className="flex-1 pb-20 w-full">
        {error && mainTab === 'loans' && (
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
              <AlertCircle size={16} />
              <p className="text-sm">Failed to load. <button onClick={handleRefresh} className="underline font-medium">Retry</button></p>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-6 max-w-screen-2xl mx-auto py-4">
          {/* Main Tabs */}
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'loans' | 'moi')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-11 rounded-xl bg-gray-100 dark:bg-gray-800/50">
              <TabsTrigger value="loans" className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
                <Landmark size={15} />
                Loans
                <span className="ml-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-semibold">
                  {loans.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="moi" className="flex items-center gap-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
                <BarChart3 size={15} />
                MOI
                <span className="ml-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-semibold">
                  {moiTransactions.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Loans Tab */}
            <TabsContent value="loans">
              {loans.length === 0 && !error ? (
                <EmptyState />
              ) : (
                <div>
                  {/* Search + Actions */}
                  <div className="flex items-center gap-2 mb-4">
                    <SearchBox />
                    <LoanFilters />
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
                    >
                      <RefreshCw size={15} className={isRefreshing ? "animate-spin text-blue-500" : "text-gray-500"} />
                    </button>
                  </div>

                  {/* Active / Completed sub-tabs */}
                  <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/50">
                      <TabsTrigger value="active" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
                        Active ({activeLoans.length})
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
                        Completed ({completedLoans.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active">
                      {activeLoans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Search size={20} className="text-gray-400" />
                          </div>
                          <h3 className="text-base font-semibold mb-1">No active loans</h3>
                          <p className="text-sm text-muted-foreground max-w-[240px]">
                            {searchQuery ? "No active loans match your search." : "You don't have any active loans."}
                          </p>
                          {!searchQuery && (
                            <Button onClick={() => navigate("/add-loan")} className="mt-4 gap-2 rounded-xl" size="sm">
                              <PlusCircle size={14} />
                              Add Loan
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {activeLoans.map((loan) => (
                            <LoanCard key={loan.id} loan={loan} />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed">
                      {completedLoans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Search size={20} className="text-gray-400" />
                          </div>
                          <h3 className="text-base font-semibold mb-1">No completed loans</h3>
                          <p className="text-sm text-muted-foreground max-w-[240px]">
                            {searchQuery ? "No completed loans match your search." : "No completed loans yet."}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {completedLoans.map((loan) => (
                            <LoanCard key={loan.id} loan={loan} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </TabsContent>

            {/* MOI Tab */}
            <TabsContent value="moi">
              <MOIDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
