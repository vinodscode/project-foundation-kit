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
import SearchBox from "./SearchBox";

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
    <div className="flex items-center gap-2">
      {/* Search Box */}
      <SearchBox />

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            <span className="hidden sm:inline">Sort</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className="flex items-center justify-between"
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter loans</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Loan Type Filter */}
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Loan Type
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.loanType.includes('Gold')}
            onCheckedChange={(checked) => handleLoanTypeFilter('Gold', checked)}
          >
            Gold Loans
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.loanType.includes('Bond')}
            onCheckedChange={(checked) => handleLoanTypeFilter('Bond', checked)}
          >
            Bond Loans
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.loanType.includes('Other')}
            onCheckedChange={(checked) => handleLoanTypeFilter('Other', checked)}
          >
            Other Loans
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuSeparator />
          
          {/* Amount Range Filter */}
          <Dialog open={amountRangeDialog} onOpenChange={setAmountRangeDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex items-center justify-between w-full">
                  <span>Amount Range</span>
                  {filters.amountRange && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter by Amount Range</DialogTitle>
                <DialogDescription>
                  Set minimum and maximum loan amounts to filter
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="min-amount">Minimum Amount</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="Enter minimum amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-amount">Maximum Amount</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="Enter maximum amount"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAmountRangeApply} className="flex-1">
                    Apply Filter
                  </Button>
                  {filters.amountRange && (
                    <Button onClick={clearAmountRange} variant="outline">
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
              <DropdownMenuItem onClick={clearFilters} className="text-destructive">
                <X size={16} className="mr-2" />
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
