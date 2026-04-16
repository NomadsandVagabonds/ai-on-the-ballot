"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/shared/SearchBar";
import type { SearchResult } from "@/types/domain";

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Group results by type
  const candidateResults = results.filter((r) => r.type === "candidate");
  const raceResults = results.filter((r) => r.type === "race");
  const stateResults = results.filter((r) => r.type === "state");

  const hasResults = results.length > 0;
  const showEmpty = hasSearched && !isLoading && !hasResults;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-8">
        Search
      </h1>

      <SearchBar onSearch={handleSearch} variant="full" />

      {/* Results area */}
      <div className="mt-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-3 text-text-muted py-8">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Searching...</span>
          </div>
        )}

        {/* No query prompt */}
        {!hasSearched && !isLoading && (
          <p className="text-text-muted text-lg py-8">
            Search for candidates by name, states, or races to get started.
          </p>
        )}

        {/* No results */}
        {showEmpty && (
          <p className="text-text-muted text-lg py-8">
            No results found for &ldquo;{query}&rdquo;. Try a different search
            term.
          </p>
        )}

        {/* Grouped results */}
        {!isLoading && hasResults && (
          <div className="space-y-8">
            {/* Candidates */}
            {candidateResults.length > 0 && (
              <ResultGroup title="Candidates">
                {candidateResults.map((result) => (
                  <ResultItem key={result.url} result={result} />
                ))}
              </ResultGroup>
            )}

            {/* Races */}
            {raceResults.length > 0 && (
              <ResultGroup title="Races">
                {raceResults.map((result) => (
                  <ResultItem key={result.url} result={result} />
                ))}
              </ResultGroup>
            )}

            {/* States */}
            {stateResults.length > 0 && (
              <ResultGroup title="States">
                {stateResults.map((result) => (
                  <ResultItem key={result.url} result={result} />
                ))}
              </ResultGroup>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="bg-bg-surface border border-border rounded-lg divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ResultItem({ result }: { result: SearchResult }) {
  const typeIcon = {
    candidate: (
      <svg
        className="h-5 w-5 text-text-muted shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
    race: (
      <svg
        className="h-5 w-5 text-text-muted shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
        />
      </svg>
    ),
    state: (
      <svg
        className="h-5 w-5 text-text-muted shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
        />
      </svg>
    ),
  };

  return (
    <Link
      href={result.url}
      className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors"
    >
      {typeIcon[result.type]}
      <div className="min-w-0 flex-1">
        <p className="text-text-primary font-medium truncate">{result.label}</p>
        <p className="text-sm text-text-muted truncate">{result.sublabel}</p>
      </div>
      <svg
        className="h-4 w-4 text-text-muted shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </Link>
  );
}

