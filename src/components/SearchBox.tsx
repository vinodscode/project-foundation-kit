import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLoanStore } from '@/lib/store';

const SearchBox = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchQuery = useLoanStore((state) => state.searchQuery);
  const setSearchQuery = useLoanStore((state) => state.setSearchQuery);
  const clearSearch = useLoanStore((state) => state.clearSearch);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search borrowers..."
        className="w-full h-10 pl-9 pr-9 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
      />
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={14} className="text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
