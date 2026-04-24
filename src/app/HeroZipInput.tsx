"use client";

import { useRouter } from "next/navigation";
import { ZipCodeInput } from "@/components/shared/ZipCodeInput";

interface HeroZipInputProps {
  variant?: "hero" | "hero-dark" | "card-dark" | "compact";
}

export function HeroZipInput({ variant = "hero" }: HeroZipInputProps) {
  const router = useRouter();

  return (
    <ZipCodeInput
      onSubmit={(zip) => {
        router.push(`/lookup?zip=${zip}`);
      }}
      variant={variant}
    />
  );
}
