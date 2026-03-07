import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, SortAsc, SortDesc, X } from "lucide-react";
import { useLoanStore, SortOption } from "@/lib/store";

const LoanFilters = () => {
  const [amountRangeDialog, setAmountRangeDialog] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const sortBy = useLoanStore((state) => state.sortBy);
  const sortOrder = useLoanStore((state) => state.sortOrder);
  const filters = useLoanStore((state) => state.filters);
  const setSortBy = useLoanStore((state) => state.setSortBy);
  const setSortOrder = useLoanStore((state) => state.setSortOrder);
  const setFilters = useLoanStore((state) => state.setFilters);
  const clearFilters = useLoanStore((state) => state.clearFilters);

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleLoanTypeFilter = (loanType: string, checked: boolean) => {
    const currentTypes = filters.loanType;
    if (checked) {
      setFilters({ loanType: [...currentTypes, loanType] });
    } else {
      setFilters({ loanType: currentTypes.filter(type => type !== loanType) });
    }
  };

  const handleAmountRangeApply = () => {
    const min = minAmount ? parseFloat(minAmount) : 0;
    const max = maxAmount ? parseFloat(maxAmount) : Infinity;
    if (min >= 0 && max > 0 && min <= max) {
      setFilters({ amountRange: { min, max } });
      setAmountRangeDialog(false);
    }
  };

  const clearAmountRange = () => {
    setFilters({ amountRange: null });
    setMinAmount("");
    setMaxAmount("");
  };

  const hasActiveFilters = filters.loanType.length > 0 || filters.amountRange !== null;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name', label: 'Borrower Name' },
    { value: 'amount', label: 'Loan Amount' },
    { value: 'date', label: 'Start Date' },
    { value: 'interest', label: 'Interest Rate' },
    { value: 'remaining', label: 'Remaining Amount' },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0">
            {sortOrder === 'asc' ? <SortAsc size={15} className="text-gray-500" /> : <SortDesc size={15} className="text-gray-500" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className="flex items-center justify-between rounded-lg"
            >
              <span className="text-sm">{option.label}</span>
              {sortBy === option.value && (
                sortOrder === 'asc' ? <SortAsc size={13} className="text-blue-500" /> : <SortDesc size={13} className="text-blue-500" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0">
            <Filter size={15} className="text-gray-500" />
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <DropdownMenuLabel className="text-xs">Filter loans</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Loan Type
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.loanType.includes('Gold')}
            onCheckedChange={(checked) => handleLoanTypeFilter('Gold', checked)}
            className="rounded-lg"
          >
            Gold Loans
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.loanType.includes('Bond')}
            onCheckedChange={(checked) => handleLoanTypeFilter('Bond', checked)}
            className="rounded-lg"
          >
            Bond Loans
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.loanType.includes('Other')}
            onCheckedChange={(checked) => handleLoanTypeFilter('Other', checked)}
            className="rounded-lg"
          >
            Other Loans
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <Dialog open={amountRangeDialog} onOpenChange={setAmountRangeDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg">
                <div className="flex items-center justify-between w-full">
                  <span>Amount Range</span>
                  {filters.amountRange && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm rounded-2xl">
              <DialogHeader>
                <DialogTitle>Filter by Amount</DialogTitle>
                <DialogDescription>Set min and max loan amounts</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="min-amount" className="text-sm">Minimum</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-amount" className="text-sm">Maximum</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="No limit"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAmountRangeApply} className="flex-1 rounded-xl h-10">
                    Apply
                  </Button>
                  {filters.amountRange && (
                    <Button onClick={clearAmountRange} variant="outline" className="rounded-xl h-10">
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFilters} className="text-destructive rounded-lg">
                <X size={14} className="mr-2" />
                Clear All Filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LoanFilters;
