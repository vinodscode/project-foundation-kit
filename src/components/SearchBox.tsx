import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoanStore } from '@/lib/store';

const SearchBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const setSearchQuery = useLoanStore((state) => state.setSearchQuery);
  const clearSearch = useLoanStore((state) => state.clearSearch);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchQuery(value);
  };

  // Handle clearing the search
  const handleClearSearch = () => {
    setSearchTerm('');
    clearSearch();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Open the search box
  const openSearch = () => {
    setIsOpen(true);
    // Focus the input after a small delay to ensure it's ready
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Close the search box
  const closeSearch = () => {
    setIsOpen(false);
    setSearchTerm('');
    clearSearch();
  };

  // Handle click outside to close the search box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && isOpen) {
        closeSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close the search box
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  return (
    <div ref={searchRef} className="relative flex items-center">
      {!isOpen ? (
        <Button
          onClick={openSearch}
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <Search size={18} />
        </Button>
      ) : (
        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm animate-in slide-in-from-right-5 duration-200">
          <div className="flex-1 relative flex items-center">
            <Search size={18} className="absolute left-2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search loans..."
              className="px-9 py-2 w-full text-sm bg-transparent outline-none"
            />
            {searchTerm && (
              <Button 
                onClick={handleClearSearch} 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 h-full px-2"
              >
                <X size={16} className="text-gray-400" />
              </Button>
            )}
          </div>
          <Button
            onClick={closeSearch}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mx-1"
          >
            <X size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
