import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import LoanCard from "@/components/LoanCard";
import { useLoanStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBox from "@/components/SearchBox";
import { Loan } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  
  const loans = useLoanStore((state) => state.loans);
  const isLoading = useLoanStore((state) => state.isLoading);
  const searchQuery = useLoanStore((state) => state.searchQuery);
  const fetchLoans = useLoanStore((state) => state.fetchLoans);
  const getTotalLent = useLoanStore((state) => state.getTotalLent);
  const getMonthlyInterest = useLoanStore((state) => state.getMonthlyInterest);
  const getFilteredLoans = useLoanStore((state) => state.getFilteredLoans);
  
  useEffect(() => {
    console.log("Index: Fetching loans");
    fetchLoans().catch(err => {
      console.error("Error fetching loans in Index page:", err);
    });
  }, [fetchLoans]);
  
  const renderLoading = () => (
    <div className="container px-4 sm:px-6 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  if (isLoading) {
    console.log("Index: Showing loading state");
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 w-full">
        <div className="animate-pulse">
          <div className="h-16 w-full bg-gray-200 dark:bg-gray-800 mb-4"></div>
        </div>
        {renderLoading()}
      </div>
    );
  }
  
  const filteredLoans = getFilteredLoans();
  console.log("Index: Search query:", searchQuery, "Total loans:", loans.length, "Filtered loans:", filteredLoans.length);
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 w-full">
      <Header 
        totalAmount={getTotalLent()}
        monthlyInterest={getMonthlyInterest()}
        totalInterestReceived={0}
        remainingPrincipal={0}
      />
      
      <main className="flex-1 pb-20 w-full">
        {loans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="container px-4 sm:px-6 max-w-screen-2xl mx-auto py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-xl font-medium">Your Loans</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SearchBox />
                <Button
                  onClick={() => navigate("/add-loan")}
                  className="gap-2 ml-auto sm:ml-0"
                  size="sm"
                  variant="outline"
                >
                  <PlusCircle size={16} />
                  <span>Add Loan</span>
                </Button>
              </div>
            </div>
            
            {filteredLoans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                  <Search size={20} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">No results found</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  We couldn't find any loans matching your search. Try adjusting your search terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
