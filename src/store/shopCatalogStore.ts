import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SHOP_CACHE_VERSION } from "@/config/shopSheet";
import type { ShopCatalogCache, ShopCatalogProduct } from "@/types/shopCatalog";

type ShopCatalogState = ShopCatalogCache & {
  isSyncing: boolean;
  fetchFailed: boolean;
  pricesUpdatedFlash: boolean;
  setProducts: (products: ShopCatalogProduct[]) => void;
  setSheetLastUpdated: (ts: string | null) => void;
  setCsvFingerprint: (fp: string | null) => void;
  setLastFetchedAt: (ts: string | null) => void;
  setIsSyncing: (v: boolean) => void;
  setFetchFailed: (v: boolean) => void;
  flashPricesUpdated: () => void;
  clearPricesUpdatedFlash: () => void;
};

const emptyCache: ShopCatalogCache = {
  products: [],
  last_fetched_at: null,
  sheet_last_updated: null,
  csv_fingerprint: null,
  cache_version: SHOP_CACHE_VERSION,
};

export const useShopCatalogStore = create<ShopCatalogState>()(
  persist(
    (set) => ({
      ...emptyCache,
      isSyncing: false,
      fetchFailed: false,
      pricesUpdatedFlash: false,
      setProducts: (products) => set({ products }),
      setSheetLastUpdated: (sheet_last_updated) => set({ sheet_last_updated }),
      setCsvFingerprint: (csv_fingerprint) => set({ csv_fingerprint }),
      setLastFetchedAt: (last_fetched_at) => set({ last_fetched_at }),
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      setFetchFailed: (fetchFailed) => set({ fetchFailed }),
      flashPricesUpdated: () => set({ pricesUpdatedFlash: true }),
      clearPricesUpdatedFlash: () => set({ pricesUpdatedFlash: false }),
    }),
    {
      name: "instahelp-shop-catalog",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        products: s.products,
        last_fetched_at: s.last_fetched_at,
        sheet_last_updated: s.sheet_last_updated,
        csv_fingerprint: s.csv_fingerprint,
        cache_version: s.cache_version,
      }),
    },
  ),
);

export function getCachedProducts(): ShopCatalogProduct[] {
  return useShopCatalogStore.getState().products;
}

export function isCacheStale(): boolean {
  const { last_fetched_at } = useShopCatalogStore.getState();
  if (!last_fetched_at) return true;
  const age = Date.now() - new Date(last_fetched_at).getTime();
  return age > 24 * 60 * 60 * 1000;
}
