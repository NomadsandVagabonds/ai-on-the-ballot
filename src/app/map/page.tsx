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
    <div>
      {/* Dark hero section with map */}
      <section
        className="w-full"
        style={{ backgroundColor: "#0F1419" }}
      >
        <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-14">
          <div className="text-center mb-6 md:mb-10">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
              Explore by State
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Click any highlighted state to see tracked races and candidate
              positions on AI policy.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <USMap states={states} />
        </div>
      </section>
    </div>
  );
}
