'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
  delay?: number;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onChange, delay = 300, value: propValue = '', placeholder = 'Search...', ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState(propValue);
    
    React.useEffect(() => {
      setInputValue(propValue);
    }, [propValue]);

    React.useEffect(() => {
      const handler = setTimeout(() => {
        onChange(inputValue as string);
      }, delay);

      return () => clearTimeout(handler);
    }, [inputValue, delay, onChange]);

    const handleClear = () => {
      setInputValue('');
      onChange('');
    };

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <svg
          className="absolute left-3 h-4 w-4 text-[var(--text-secondary)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] pl-10 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-150 focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
          {...props}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
