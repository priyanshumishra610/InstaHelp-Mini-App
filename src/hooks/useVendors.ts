import {
  subscribeVendors,
  VENDOR_EXPLORE_FETCH_LIMIT,
  type VendorQueryFilters,
} from "@/firebase/vendors";
import { useFirestoreCatalog } from "@/firebase/config";
import { getVendorCatalog } from "@/services/vendors/getVendorCatalog";
import type { VendorCatalogSort } from "@/services/vendors/vendorCatalogTypes";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UseVendorsOptions = VendorQueryFilters & {
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
  source: "firestore" | "local_json";
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
  const firestore = useFirestoreCatalog();
  const enabled = options.enabled !== false;

  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const optionsRef = useRef(options);
  optionsRef.current = options;

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

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const applyLocalCatalog = () => {
      const { vendors: local, hasMore: more } = queryLocalCatalog(
        optionsRef.current,
      );
      setVendors(local);
      setHasMore(more);
      setLoading(false);
      setRefreshing(false);
      setError(null);
    };

    if (!firestore) {
      applyLocalCatalog();
      return;
    }

    setLoading((cur) => (refreshing ? cur : true));

    const unsub = subscribeVendors(
      {
        ...optionsRef.current,
        pageCount: 1,
        pageSize: VENDOR_EXPLORE_FETCH_LIMIT,
      },
      (rows) => {
        if (rows.length === 0) {
          applyLocalCatalog();
          return;
        }
        setVendors(rows);
        setHasMore(rows.length >= VENDOR_EXPLORE_FETCH_LIMIT);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      },
      (err) => {
        const { vendors: local } = queryLocalCatalog(optionsRef.current);
        setVendors(local);
        setHasMore(false);
        setLoading(false);
        setRefreshing(false);
        setError(local.length ? null : err);
      },
    );

    return () => unsub();
  }, [
    enabled,
    firestore,
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

  const source = firestore ? "firestore" : "local_json";

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
      source,
    }),
    [
      vendors,
      loading,
      refreshing,
      error,
      hasMore,
      loadMore,
      refresh,
      retry,
      source,
    ],
  );
}
