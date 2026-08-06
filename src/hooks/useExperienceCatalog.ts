import {
  FALLBACK_COUNTRIES,
  FALLBACK_HOLIDAYS,
} from "@/constants/experienceSections";
import {
  filterResorts,
  getAllResorts,
  getResortCatalogMeta,
  type ResortListFilters,
} from "@/services/resorts/getResortCatalog";
import { useExperienceCatalogStore } from "@/store/experienceCatalogStore";
import type {
  CountryDestination,
  HolidayPackage,
} from "@/types/experienceCatalog";
import type { ResortCatalogMeta, ResortRecord } from "@/types/resortExperience";
import { useMemo } from "react";

export function useResorts(filters?: ResortListFilters): ResortRecord[] {
  const live = useExperienceCatalogStore((s) => s.resorts);
  return useMemo(() => {
    const source = live.length > 0 ? live : getAllResorts();
    if (!filters) return source;
    // filterResorts reads bundled data; apply the same filter locally on live.
    const q = filters.query?.trim().toLowerCase();
    return source
      .filter((r) => {
        if (filters.state && r.state !== filters.state) return false;
        if (filters.priceTier && r.priceTier !== filters.priceTier) return false;
        if (filters.region && r.region !== filters.region) return false;
        if (!q) return true;
        const hay = [
          r.name,
          r.location,
          r.state,
          r.region,
          r.category,
          r.estimatedPriceLabel,
          ...r.experienceTypes,
          ...r.roomTypes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const ar = a.rank != null && a.rank > 0 ? a.rank : 9999;
        const br = b.rank != null && b.rank > 0 ? b.rank : 9999;
        if (ar !== br) return ar - br;
        const imgDiff =
          (b.imageUrls.length > 0 ? 1 : 0) - (a.imageUrls.length > 0 ? 1 : 0);
        if (imgDiff !== 0) return imgDiff;
        return a.name.localeCompare(b.name);
      });
  }, [live, filters?.query, filters?.state, filters?.priceTier, filters?.region]);
}

export function useAllResorts(): ResortRecord[] {
  const live = useExperienceCatalogStore((s) => s.resorts);
  return live.length > 0 ? live : getAllResorts();
}

export function useResortMeta(): ResortCatalogMeta {
  const live = useExperienceCatalogStore((s) => s.resortMeta);
  return live ?? getResortCatalogMeta();
}

export function useHolidayPackages(): HolidayPackage[] {
  const live = useExperienceCatalogStore((s) => s.holidays);
  return live.length > 0 ? live : FALLBACK_HOLIDAYS;
}

export function useCountryDestinations(): CountryDestination[] {
  const live = useExperienceCatalogStore((s) => s.countries);
  return live.length > 0 ? live : FALLBACK_COUNTRIES;
}

// Keep filterResorts import used for type parity / tree hints in editors.
void filterResorts;
