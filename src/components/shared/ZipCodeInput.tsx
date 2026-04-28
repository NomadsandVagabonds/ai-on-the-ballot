"use client";

import { useState } from "react";
import { isValidZipCode } from "@/lib/utils/states";

interface ZipCodeInputProps {
  onSubmit: (zip: string) => void;
  variant?: "hero" | "hero-dark" | "card-dark" | "compact";
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

  if (variant === "hero" || variant === "hero-dark") {
    const isDark = variant === "hero-dark";
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
              placeholder="Enter your zip code"
              className={`w-full rounded-lg border px-4 py-3.5 text-base font-mono tracking-widest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent focus:shadow-[inset_0_1px_4px_rgba(46,64,87,0.08)] ${
                isDark
                  ? `bg-white/10 text-white placeholder:text-gray-500 ${error ? "border-red-400" : "border-white/20"}`
                  : `bg-bg-surface text-text-primary placeholder:text-text-muted ${error ? "border-red-400" : "border-border"}`
              }`}
              aria-label="Zip code"
              aria-invalid={!!error}
              aria-describedby={error ? "zip-error" : undefined}
            />
          </div>
          <button
            type="submit"
            className="btn-press shrink-0 rounded-lg bg-accent-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 transition-colors"
          >
            Find Your Reps
          </button>
        </form>
        {error && (
          <p id="zip-error" className={`mt-2 text-sm ${isDark ? "text-red-400" : "text-red-600"}`} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (variant === "card-dark") {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="ZIP code"
            className={`flex-1 min-w-0 rounded-md border bg-white/[0.06] px-3 py-2 text-sm font-mono tracking-[0.15em] text-white placeholder:text-white/35 transition-colors focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber/70 ${
              error ? "border-red-400/70" : "border-white/20"
            }`}
            aria-label="Zip code"
            aria-invalid={!!error}
            aria-describedby={error ? "zip-card-error" : undefined}
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-amber px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-[var(--amber-hover)]"
          >
            Find
          </button>
        </form>
        {error && (
          <p
            id="zip-card-error"
            className="mt-2 text-xs text-red-300"
            role="alert"
          >
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
          className="btn-press shrink-0 rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-1 transition-colors"
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
