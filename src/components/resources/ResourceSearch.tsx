'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ResourceSearchProps {
  value: string;
  onChange: (query: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
}

export default function ResourceSearch({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Search resources (e.g., sleep, exam tips, helpline)" 
}: ResourceSearchProps) {
  const [query, setQuery] = useState(value);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onChange(searchQuery);
    }, 300),
    [onChange]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(query);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-warm-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-12 py-4 text-warm-gray-900 
            bg-white/90 backdrop-blur-sm 
            border border-sage-200 rounded-2xl
            focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500
            placeholder-warm-gray-400
            shadow-soft hover:shadow-medium
            transition-all duration-200
          "
          autoComplete="off"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 pr-4 flex items-center
              text-warm-gray-400 hover:text-warm-gray-600
              transition-colors duration-200
            "
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Keyboard shortcut hint */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center space-x-1 text-xs text-warm-gray-400 pointer-events-none">
        {!query && (
          <>
            <kbd className="px-1.5 py-0.5 bg-sage-100 rounded text-warm-gray-500">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-sage-100 rounded text-warm-gray-500">K</kbd>
          </>
        )}
      </div>
    </form>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}