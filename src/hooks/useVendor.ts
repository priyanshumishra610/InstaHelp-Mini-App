import { subscribeVendorById } from "@/firebase/vendors";
import { useFirestoreCatalog } from "@/firebase/config";
import { getVendorCatalog } from "@/services/vendors/getVendorCatalog";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useCallback, useEffect, useState } from "react";

export function useVendor(vendorId: string | undefined) {
  const firestore = useFirestoreCatalog();
  const [vendor, setVendor] = useState<VendorRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(vendorId));
  const [error, setError] = useState<Error | null>(null);

  const retry = useCallback(() => setError(null), []);

  useEffect(() => {
    const id = vendorId?.trim();
    if (!id) {
      setVendor(null);
      setLoading(false);
      return;
    }

    if (!firestore) {
      const found = getVendorCatalog().getById(id) ?? null;
      setVendor(found);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeVendorById(
      id,
      (row) => {
        setVendor(row);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [firestore, vendorId, retry]);

  return { vendor, loading, error, retry };
}
