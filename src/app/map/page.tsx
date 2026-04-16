import type { Metadata } from "next";
import { getAllStatesForMap } from "@/lib/queries/states";
import { USMap } from "@/components/map/USMap";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Explore by State",
  description:
    "Interactive map showing U.S. states with tracked congressional races and AI policy positions.",
};

export default async function MapPage() {
  const states = await getAllStatesForMap();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-2">
          Explore by State
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Select a state to see tracked races and candidate positions on AI
          policy issues.
        </p>
      </div>

      <USMap states={states} />
    </div>
  );
}
