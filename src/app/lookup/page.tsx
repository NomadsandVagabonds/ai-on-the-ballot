"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ZipCodeInput } from "@/components/shared/ZipCodeInput";
import type { LookupResult } from "@/types/domain";

function LookupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialZip = searchParams.get("zip");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialZip && /^\d{5}$/.test(initialZip)) {
      handleLookup(initialZip);
    }
    // Only run on mount with the initial zip
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLookup(zip: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/lookup?zip=${zip}`);

      if (!res.ok) {
        const data = await res.json();
        if (data.fallback) {
          // Civic API not configured — show a helpful message
          setError(
            "Zip code lookup is not yet available. Browse by state instead."
          );
          setLoading(false);
          return;
        }
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const result: LookupResult = await res.json();

      // Build the redirect URL
      const url = result.district
        ? `/state/${result.state_slug}?district=${result.district}`
        : `/state/${result.state_slug}`;

      router.push(url);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 md:py-24 text-center">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-3">
        Find Your Representatives
      </h1>
      <p className="text-text-secondary mb-8">
        Enter your zip code to see which races and candidates are tracked in
        your area.
      </p>

      <div className="flex justify-center mb-6">
        <ZipCodeInput
          onSubmit={(zip) => {
            // Update URL so the zip is visible
            window.history.replaceState(null, "", `/lookup?zip=${zip}`);
            handleLookup(zip);
          }}
          variant="hero"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-text-muted">
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">Looking up your district...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <p className="mt-2">
            <a
              href="/map"
              className="font-medium text-accent-primary hover:underline"
            >
              Browse the map instead
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 md:py-24 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Find Your Representatives
          </h1>
          <p className="text-text-secondary mb-8">Loading...</p>
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  );
}
