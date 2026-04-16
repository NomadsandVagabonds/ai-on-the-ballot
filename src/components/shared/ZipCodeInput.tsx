"use client";

import { useState } from "react";
import { isValidZipCode } from "@/lib/utils/states";

interface ZipCodeInputProps {
  onSubmit: (zip: string) => void;
  variant?: "hero" | "compact";
}

export function ZipCodeInput({ onSubmit, variant = "hero" }: ZipCodeInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Enter a zip code");
      return;
    }

    if (!isValidZipCode(trimmed)) {
      setError("Enter a valid 5-digit zip code");
      return;
    }

    setError(null);
    onSubmit(trimmed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 5);
    setValue(raw);
    if (error) setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (variant === "hero") {
    return (
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter zip code"
              className={`w-full rounded-lg border px-4 py-3 text-base text-text-primary placeholder:text-text-muted bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow ${
                error ? "border-red-400" : "border-border"
              }`}
              aria-label="Zip code"
              aria-invalid={!!error}
              aria-describedby={error ? "zip-error" : undefined}
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-accent-primary px-6 py-3 text-base font-semibold text-white hover:bg-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 transition-colors"
          >
            Find Your Reps
          </button>
        </form>
        {error && (
          <p id="zip-error" className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Zip code"
          className={`w-24 rounded-md border px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow ${
            error ? "border-red-400" : "border-border"
          }`}
          aria-label="Zip code"
          aria-invalid={!!error}
          aria-describedby={error ? "zip-compact-error" : undefined}
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1 transition-colors"
        >
          Go
        </button>
      </form>
      {error && (
        <p id="zip-compact-error" className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
