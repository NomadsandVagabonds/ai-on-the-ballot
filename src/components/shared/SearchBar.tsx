"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  variant?: "compact" | "full";
}

export function SearchBar({
  onSearch,
  placeholder = "Search candidates, states, or races...",
  variant = "full",
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch?.(query);
      }, 300);
    },
    [onSearch]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setValue("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const isCompact = variant === "compact";

  return (
    <div className={`relative ${isCompact ? "w-48 lg:w-56" : "w-full"}`}>
      {/* Search icon */}
      <svg
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none ${
          isCompact ? "h-4 w-4" : "h-5 w-5"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow ${
          isCompact
            ? "pl-9 pr-8 py-1.5 text-sm"
            : "pl-11 pr-10 py-3 text-base"
        }`}
        aria-label="Search"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors ${
            isCompact ? "right-2" : "right-3"
          }`}
          aria-label="Clear search"
        >
          <svg
            className={isCompact ? "h-4 w-4" : "h-5 w-5"}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
