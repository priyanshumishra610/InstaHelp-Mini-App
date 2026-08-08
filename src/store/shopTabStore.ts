import { create } from "zustand";

export type ShopTabSection = "shop" | "giftcards";

type ShopTabState = {
  section: ShopTabSection;
  setSection: (section: ShopTabSection) => void;
};

/** Tracks Gift Cards vs Shop segment inside the Shop tab (for tab bar chrome). */
export const useShopTabStore = create<ShopTabState>((set) => ({
  section: "giftcards",
  setSection: (section) => set({ section }),
}));
