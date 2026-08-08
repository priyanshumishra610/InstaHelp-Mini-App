import { getVendorCatalog } from "@/services/vendors/getVendorCatalog";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useCallback, useEffect, useState } from "react";

export function useFeaturedVendors(max = 8) {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const retry = useCallback(() => setError(null), []);

  useEffect(() => {
    const catalog = getVendorCatalog();
    const featured = catalog
      .query({
        search: "",
        areaKey: null,
        verifiedOnly: false,
        availableNowOnly: false,
        sort: "recommended",
        userLocation: null,
      })
      .filter((v) => v.sponsorTier === "featured" || v.listingBoost > 0)
      .slice(0, max);
    setVendors(featured);
    setLoading(false);
    setError(null);
  }, [max, retry]);

  return { vendors, loading, error, retry };
}
