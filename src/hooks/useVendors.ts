import { getVendorCatalog } from "@/services/vendors/getVendorCatalog";
import type {
  VendorCatalogQuery,
  VendorCatalogSort,
} from "@/services/vendors/vendorCatalogTypes";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";

export type UseVendorsOptions = Omit<
  VendorCatalogQuery,
  "sort" | "userLocation"
> & {
  city?: string | null;
  sort: VendorCatalogSort;
  userLocation: { lat: number; lng: number } | null;
  enabled?: boolean;
};

export type UseVendorsResult = {
  vendors: VendorRecord[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  hasMore: boolean;
  pageCount: number;
  loadMore: () => void;
  refresh: () => void;
  retry: () => void;
  source: "local_json";
};

function queryLocalCatalog(options: UseVendorsOptions) {
  const catalog = getVendorCatalog();
  const vendors = catalog.query({
    search: options.search,
    areaKey: options.areaKey,
    cityKey: options.cityKey ?? null,
    category: options.category,
    verifiedOnly: options.verifiedOnly,
    availableNowOnly: options.availableNowOnly,
    sort: options.sort,
    userLocation: options.userLocation,
  });
  return {
    vendors,
    hasMore: false,
  };
}

export function useVendors(options: UseVendorsOptions): UseVendorsResult {
  const enabled = options.enabled !== false;

  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const hasLoadedOnce = useRef(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setRetryKey((k) => k + 1);
  }, []);

  const loadMore = useCallback(() => {}, []);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryKey((k) => k + 1);
  }, []);

  const applyQuery = useCallback(() => {
    try {
      const { vendors: local, hasMore: more } = queryLocalCatalog(
        optionsRef.current,
      );
      setVendors(local);
      setHasMore(more);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      hasLoadedOnce.current = true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Catalog query failed"));
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      applyQuery();
    };

    if (!hasLoadedOnce.current) {
      run();
      return () => {
        cancelled = true;
      };
    }

    const task = InteractionManager.runAfterInteractions(run);
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [
    enabled,
    applyQuery,
    retryKey,
    options.search,
    options.areaKey,
    options.cityKey,
    options.category,
    options.city,
    options.verifiedOnly,
    options.availableNowOnly,
    options.sort,
    options.userLocation?.lat,
    options.userLocation?.lng,
    refreshing,
  ]);

  return useMemo(
    () => ({
      vendors,
      loading,
      refreshing,
      error,
      hasMore,
      pageCount: 1,
      loadMore,
      refresh,
      retry,
      source: "local_json" as const,
    }),
    [vendors, loading, refreshing, error, hasMore, loadMore, refresh, retry],
  );
}
