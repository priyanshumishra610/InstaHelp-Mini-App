import { getVendorCatalog } from "@/services/vendors/getVendorCatalog";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useCallback, useEffect, useState } from "react";

export function useVendor(vendorId: string | undefined) {
  const [vendor, setVendor] = useState<VendorRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(vendorId));
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setRetryCount((n) => n + 1);
  }, []);

  useEffect(() => {
    const id = vendorId?.trim();
    if (!id) {
      setVendor(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      const found = getVendorCatalog().getById(id) ?? null;
      setVendor(found);
      setError(null);
    } catch (e) {
      setVendor(null);
      setError(e instanceof Error ? e : new Error("Failed to load vendor"));
    } finally {
      setLoading(false);
    }
  }, [vendorId, retryCount]);

  const notFound = Boolean(vendorId?.trim()) && !loading && !error && vendor == null;

  return { vendor, loading, error, notFound, retry };
}
