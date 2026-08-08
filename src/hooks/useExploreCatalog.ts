import { useExploreFilters } from "@/hooks/useExploreFilters";
import { useExploreReveal } from "@/hooks/useExploreReveal";
import { useExploreVendorsData } from "@/hooks/useExploreVendorsData";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";

type InitialParams = {
  search?: string;
  category?: string;
};

export { distanceKmFromUser } from "@/hooks/useExploreVendorsData";

/** Composes filter, vendor data, and reveal hooks for the explore/home catalog. */
export function useExploreCatalog(initial?: InitialParams) {
  const filters = useExploreFilters(initial);
  const vendors = useExploreVendorsData(filters);
  const reveal = useExploreReveal();

  const toggleSortMode = useCallback(
    (next: "distance" | "rating") => {
      filters.toggleSortMode(next);
      void Haptics.selectionAsync().catch(() => {});
    },
    [filters],
  );

  const clearFilters = useCallback(() => {
    filters.clearFilters();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [filters]);

  return {
    ...filters,
    ...vendors,
    ...reveal,
    toggleSortMode,
    clearFilters,
  };
}

export type ExploreCatalogState = ReturnType<typeof useExploreCatalog>;
