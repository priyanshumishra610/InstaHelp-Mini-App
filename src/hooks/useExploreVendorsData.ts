import { BANGALORE_CITY_CENTER } from "@/constants/vendorMarketplace";
import { isEarlyAccessCategory } from "@/constants/exploreEntitlements";
import type { ExploreFiltersState } from "@/hooks/useExploreFilters";
import { useVendorUserLocation } from "@/hooks/useVendorUserLocation";
import { useVendors } from "@/hooks/useVendors";
import { canViewVendorCategory } from "@/services/explore/exploreEntitlements";
import type { VendorCatalogSort } from "@/services/vendors/vendorCatalogTypes";
import { haversineKm } from "@/services/vendors/vendorGeo";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { useMemo } from "react";

function sortModeToCatalogSort(
  mode: "recommended" | "distance" | "rating",
): VendorCatalogSort {
  if (mode === "distance") return "distance";
  if (mode === "rating") return "rating";
  return "recommended";
}

export function distanceKmFromUser(
  v: VendorRecord,
  user: { lat: number; lng: number } | null,
): number | null {
  const base = user ?? BANGALORE_CITY_CENTER;
  if (!v.coordinates) return null;
  return haversineKm(base, v.coordinates);
}

export function useExploreVendorsData(filters: ExploreFiltersState) {
  const coords = useVendorUserLocation(true);

  const {
    vendors: catalogVendors,
    loading,
    refreshing,
    error,
    refresh,
    retry,
    source,
  } = useVendors({
    search: filters.catalogFilters.search,
    areaKey: filters.areaKey,
    cityKey:
      filters.multiCityMode && filters.multiCityKeys.length > 0
        ? null
        : filters.cityKey,
    category: filters.catalogFilters.category,
    city: filters.cityLabel,
    verifiedOnly: filters.verifiedOnly,
    availableNowOnly: filters.availableNowOnly,
    sort: sortModeToCatalogSort(filters.sortMode),
    userLocation: coords ?? BANGALORE_CITY_CENTER,
  });

  const filtered = useMemo(() => {
    let list = catalogVendors;

    if (filters.multiCityMode && filters.multiCityKeys.length > 0) {
      const allowed = new Set(filters.multiCityKeys);
      list = list.filter((v) => allowed.has(v.cityKey));
    }

    if (!filters.entitlements.canAccessEarlyCategories) {
      list = list.filter((v) =>
        canViewVendorCategory(v.category, filters.entitlements),
      );
    }

    return list;
  }, [
    catalogVendors,
    filters.entitlements,
    filters.multiCityKeys,
    filters.multiCityMode,
  ]);

  const sections = useMemo(() => {
    const map = new Map<string, VendorRecord[]>();
    for (const v of filtered) {
      if (
        filters.entitlements.canAccessEarlyCategories &&
        isEarlyAccessCategory(v.category)
      ) {
        continue;
      }
      const cat = v.category.trim() || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(v);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => {
        const rated = data.filter((v) => v.rating > 0);
        const avgRating =
          rated.length > 0
            ? rated.reduce((sum, v) => sum + v.rating, 0) / rated.length
            : null;
        const verifiedCount = data.filter((v) => v.isVerified).length;
        return {
          title,
          data,
          avgRating,
          verifiedCount,
        };
      });
  }, [filtered, filters.entitlements.canAccessEarlyCategories]);

  const sectionIndexByTitle = useMemo(() => {
    const map = new Map<string, number>();
    sections.forEach((section, index) => {
      map.set(section.title, index);
    });
    return map;
  }, [sections]);

  const resultSummary = useMemo(() => {
    return {
      vendorCount: filtered.length,
      categoryCount: sections.length,
    };
  }, [filtered.length, sections.length]);

  return {
    coords,
    catalogVendors,
    loading,
    refreshing,
    error,
    refresh,
    retry,
    source,
    filtered,
    sections,
    sectionIndexByTitle,
    resultSummary,
  };
}

export type ExploreVendorsDataState = ReturnType<typeof useExploreVendorsData>;
