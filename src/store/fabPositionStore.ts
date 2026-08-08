import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FabSlotId = "new-request" | "sort-filter";

export type FabPosition = {
  left: number;
  bottom: number;
};

type FabPositionState = {
  positions: Partial<Record<FabSlotId, FabPosition>>;
  setPosition: (id: FabSlotId, position: FabPosition) => void;
  clearPosition: (id: FabSlotId) => void;
};

export const useFabPositionStore = create<FabPositionState>()(
  persist(
    (set) => ({
      positions: {},
      setPosition: (id, position) =>
        set((s) => ({
          positions: { ...s.positions, [id]: position },
        })),
      clearPosition: (id) =>
        set((s) => {
          const next = { ...s.positions };
          delete next[id];
          return { positions: next };
        }),
    }),
    {
      name: "instahelp-fab-positions",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<FabPositionState>;
        const positions = { ...(state.positions ?? {}) };
        // New default: New request sits bottom-right (above Sort & Filter).
        delete positions["new-request"];
        return { positions };
      },
      partialize: (s) => ({ positions: s.positions }),
    },
  ),
);
