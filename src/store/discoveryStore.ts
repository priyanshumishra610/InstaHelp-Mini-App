import type { RecentlyViewedService } from "@/types/discovery";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DiscoveryUiState = {
  recentlyViewed: RecentlyViewedService[];
  recordView: (item: Omit<RecentlyViewedService, "viewedAt">) => void;
  clearRecentlyViewed: () => void;
};

const MAX_RECENT = 10;

export const useDiscoveryStore = create<DiscoveryUiState>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      recordView: (item) => {
        const next: RecentlyViewedService = {
          ...item,
          viewedAt: Date.now(),
        };
        const filtered = get().recentlyViewed.filter((r) => r.id !== item.id);
        set({ recentlyViewed: [next, ...filtered].slice(0, MAX_RECENT) });
      },
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "instahelp-discovery",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ recentlyViewed: s.recentlyViewed }),
    },
  ),
);
