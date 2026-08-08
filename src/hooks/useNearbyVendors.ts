import { BANGALORE_CITY_CENTER } from "@/constants/vendorMarketplace";
import { getVendorCatalog } from "@/services/vendors/getVendorCatalog";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useEffect, useState } from "react";

export function useNearbyVendors(
  userLocation: { lat: number; lng: number } | null,
  max = 6,
) {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loc = userLocation ?? BANGALORE_CITY_CENTER;

  useEffect(() => {
    const catalog = getVendorCatalog();
    const rows = catalog
      .query({
        search: "",
        areaKey: null,
        verifiedOnly: false,
        availableNowOnly: false,
        sort: "distance",
        userLocation: loc,
      })
      .slice(0, max);
    setVendors(rows);
    setLoading(false);
    setError(null);
  }, [loc.lat, loc.lng, max]);

  return { vendors, loading, error };
}
