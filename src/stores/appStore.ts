import { create } from "zustand";

interface AppState {
  /** Mobile navigation open state */
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;

  /** Global search state */
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  /** "Hide no mention" toggle for position grids */
  hideNoMention: boolean;
  toggleHideNoMention: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMobileNavOpen: false,
  toggleMobileNav: () => set((s) => ({ isMobileNavOpen: !s.isMobileNavOpen })),
  closeMobileNav: () => set({ isMobileNavOpen: false }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Default to hiding no-mention so readers start with the record, not noise.
  hideNoMention: true,
  toggleHideNoMention: () => set((s) => ({ hideNoMention: !s.hideNoMention })),
}));
