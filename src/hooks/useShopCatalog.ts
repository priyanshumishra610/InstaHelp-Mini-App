import { normalizeShopProduct } from "@/components/shop/shopFormatters";
import { useShopCatalogStore } from "@/store/shopCatalogStore";
import type { ShopCatalogProduct } from "@/types/shopCatalog";
import { useMemo } from "react";

export function useShopProducts(): ShopCatalogProduct[] {
  const products = useShopCatalogStore((s) => s.products);
  return useMemo(
    () => products.map((product) => normalizeShopProduct(product)),
    [products],
  );
}

export function useShopCatalogMeta() {
  const lastFetchedAt = useShopCatalogStore((s) => s.last_fetched_at);
  const fetchFailed = useShopCatalogStore((s) => s.fetchFailed);
  const isSyncing = useShopCatalogStore((s) => s.isSyncing);
  const isStale = useMemo(() => {
    if (!lastFetchedAt) return true;
    const age = Date.now() - new Date(lastFetchedAt).getTime();
    return age > 24 * 60 * 60 * 1000;
  }, [lastFetchedAt]);

  return { lastFetchedAt, fetchFailed, isSyncing, isStale };
}
