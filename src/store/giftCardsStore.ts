import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type RecentlyViewedGiftCard = {
  id: string;
  title: string;
  subtitle?: string;
  /** Hubble brandId when known */
  brandId?: string;
  viewedAt: number;
};

type GiftCardsUiState = {
  recentlyViewed: RecentlyViewedGiftCard[];
  recordView: (item: Omit<RecentlyViewedGiftCard, "viewedAt">) => void;
  clearRecentlyViewed: () => void;
};

const MAX_RECENT = 12;

export const useGiftCardsStore = create<GiftCardsUiState>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      recordView: (item) => {
        const next: RecentlyViewedGiftCard = {
          ...item,
          viewedAt: Date.now(),
        };
        const filtered = get().recentlyViewed.filter((r) => r.id !== item.id);
        set({ recentlyViewed: [next, ...filtered].slice(0, MAX_RECENT) });
      },
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "instahelp-giftcards",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ recentlyViewed: s.recentlyViewed }),
    },
  ),
);
