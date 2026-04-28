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
    <div className="bg-bg-elevated">
      <section className="max-w-6xl mx-auto px-4 pt-10 md:pt-14">
        <div className="text-center mb-6 md:mb-10">
          <p className="kicker mb-3">Interactive</p>
          <h1 className="font-display text-display-lg font-bold text-text-primary mb-3">
            Explore by State
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-sm md:text-base">
            Click any highlighted state to see tracked races and candidate positions on AI policy.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <USMap states={states} />
      </div>
    </div>
  );
}
