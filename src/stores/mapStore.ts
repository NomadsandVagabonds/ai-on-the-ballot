import { create } from "zustand";

interface MapState {
  /** Currently hovered state abbreviation */
  hoveredState: string | null;
  setHoveredState: (state: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  hoveredState: null,
  setHoveredState: (state) => set({ hoveredState: state }),
}));
