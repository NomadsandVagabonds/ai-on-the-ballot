"use client";

import { useRouter } from "next/navigation";
import { ZipCodeInput } from "@/components/shared/ZipCodeInput";

export function HeroZipInput() {
  const router = useRouter();

  return (
    <ZipCodeInput
      onSubmit={(zip) => {
        router.push(`/lookup?zip=${zip}`);
      }}
      variant="hero"
    />
  );
}
