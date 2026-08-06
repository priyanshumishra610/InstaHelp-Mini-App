import { create } from "zustand";

type HomeHubState = {
  visible: boolean;
  activeFilterCount: number;
  open: () => void;
  close: () => void;
  setActiveFilterCount: (count: number) => void;
};

export const useHomeHubStore = create<HomeHubState>((set) => ({
  visible: false,
  activeFilterCount: 0,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
  setActiveFilterCount: (count) => set({ activeFilterCount: count }),
}));
