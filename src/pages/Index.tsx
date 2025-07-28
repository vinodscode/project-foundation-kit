import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import LoanCard from "@/components/LoanCard";
import { useLoanStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBox from "@/components/SearchBox";
import LoanFilters from "@/components/LoanFilters";
import { Loan } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsPulling(false);
    setPullProgress(0);
    try {
      await fetchLoans();
      // Add a small delay to show the animation
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error("Error refreshing loans:", err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
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
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-xl font-medium">Your Loans</h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleRefresh}
                    size="sm"
                    variant="ghost"
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button
                    onClick={() => navigate("/add-loan")}
                    className="gap-2"
                    size="sm"
                    variant="outline"
                  >
                    <PlusCircle size={16} />
                    <span>Add Loan</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="flex-1">
                  <SearchBox />
                </div>
                <LoanFilters />
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
              <div className="relative overflow-hidden">
                {/* Pull to Refresh Indicator - positioned within loans section */}
                <div 
                  className={`relative bg-primary/10 backdrop-blur-sm transition-all duration-300 rounded-lg overflow-hidden ${
                    isPulling || isRefreshing ? 'opacity-100 mb-4' : 'opacity-0 mb-0'
                  }`}
                  style={{
                    height: `${isPulling || isRefreshing ? Math.min(pullProgress, 60) : 0}px`,
                    transform: `translateY(${isPulling || isRefreshing ? 0 : -20}px)`,
                    transition: 'all 0.3s ease-out'
                  }}
                >
                  <div className="flex items-center justify-center h-full min-h-[50px]">
                    <div className="flex items-center gap-2 text-primary px-4 py-2">
                      <RefreshCw 
                        size={18} 
                        className={`transition-all duration-300 ${
                          isRefreshing ? 'animate-spin' : ''
                        }`}
                        style={{
                          transform: `rotate(${isRefreshing ? 0 : pullProgress * 3}deg)`
                        }}
                      />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {isRefreshing ? 'Refreshing loans...' : pullProgress > 50 ? 'Release to refresh' : 'Pull to refresh'}
                      </span>
                    </div>
                  </div>
                </div>

                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 transition-transform duration-200"
                  style={{
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                    transform: `translateY(${isPulling ? Math.min(pullProgress * 0.3, 18) : 0}px)`
                  }}
                  onTouchStart={(e) => {
                    const startY = e.touches[0].clientY;
                    const scrollTop = window.scrollY;
                    let currentPullProgress = 0;
                    
                    if (scrollTop === 0 && !isRefreshing) {
                      setIsPulling(true);
                    }
                    
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                      if (scrollTop !== 0 || isRefreshing) return;
                      
                      const currentY = moveEvent.touches[0].clientY;
                      const diff = Math.max(0, currentY - startY);
                      currentPullProgress = Math.min(diff * 0.6, 60);
                      
                      setPullProgress(currentPullProgress);
                      
                      if (currentPullProgress > 0) {
                        setIsPulling(true);
                      }
                    };
                    
                    const handleTouchEnd = () => {
                      if (currentPullProgress > 50 && scrollTop === 0 && !isRefreshing) {
                        handleRefresh();
                      }
                      
                      setIsPulling(false);
                      setPullProgress(0);
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    
                    document.addEventListener('touchmove', handleTouchMove, { passive: true });
                    document.addEventListener('touchend', handleTouchEnd, { once: true });
                  }}
                >
                  {filteredLoans.map((loan) => (
                    <LoanCard key={loan.id} loan={loan} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
