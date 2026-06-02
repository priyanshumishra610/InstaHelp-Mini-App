import {
  subscribeVendors,
  VENDOR_PAGE_SIZE,
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

function queryLocalCatalog(options: UseVendorsOptions, pageCount: number) {
  const catalog = getVendorCatalog();
  const pageSize = VENDOR_PAGE_SIZE;
  const all = catalog.query({
    search: options.search,
    areaKey: options.areaKey,
    cityKey: options.cityKey ?? null,
    category: options.category,
    verifiedOnly: options.verifiedOnly,
    availableNowOnly: options.availableNowOnly,
    sort: options.sort,
    userLocation: options.userLocation,
  });
  const slice = all.slice(0, pageSize * pageCount);
  return {
    vendors: slice,
    hasMore: slice.length < all.length,
  };
}

export function useVendors(options: UseVendorsOptions): UseVendorsResult {
  const firestore = useFirestoreCatalog();
  const enabled = options.enabled !== false;

  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const refresh = useCallback(() => {
    setRefreshing(true);
    setPageCount(1);
    setRetryKey((k) => k + 1);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setPageCount((p) => p + 1);
  }, [hasMore, loading]);

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
        pageCount,
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

    setLoading((cur) => (refreshing ? cur : pageCount === 1));

    const unsub = subscribeVendors(
      {
        ...optionsRef.current,
        pageCount,
        pageSize: VENDOR_PAGE_SIZE,
      },
      (rows) => {
        if (rows.length === 0) {
          applyLocalCatalog();
          return;
        }
        setVendors(rows);
        setHasMore(rows.length >= pageCount * VENDOR_PAGE_SIZE);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      },
      (err) => {
        const { vendors: local } = queryLocalCatalog(
          optionsRef.current,
          pageCount,
        );
        setVendors(local);
        setHasMore(local.length >= pageCount * VENDOR_PAGE_SIZE);
        setLoading(false);
        setRefreshing(false);
        setError(local.length ? null : err);
      },
    );

    return () => unsub();
  }, [
    enabled,
    firestore,
    pageCount,
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
      pageCount,
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
      pageCount,
      loadMore,
      refresh,
      retry,
      source,
    ],
  );
}
