import { FALLBACK_COUNTRIES } from "@/constants/experienceSections";
import {
  filterHolidays,
  getAllHolidays,
  getHolidayCatalogMeta,
  type HolidayCatalogMeta,
  type HolidayListFilters,
} from "@/services/holidays/getHolidayCatalog";
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
import { matchesSearchQuery } from "@/utils/searchMatch";
import { useMemo } from "react";

function resortMatchesQuery(r: ResortRecord, query: string | undefined) {
  return matchesSearchQuery(
    [
      r.name,
      r.location,
      r.state,
      r.region,
      r.category,
      r.estimatedPriceLabel,
      r.priceTier,
      ...r.experienceTypes,
      ...r.roomTypes,
    ],
    query,
  );
}

function holidayMatchesQuery(h: HolidayPackage, query: string | undefined) {
  return matchesSearchQuery(
    [
      h.id,
      h.title,
      h.country,
      h.region,
      h.destination,
      h.theme,
      h.vibe,
      h.tripStyle,
      h.budgetTier,
      h.priceFrom,
      h.duration,
      h.bestMonths,
      h.visaType,
      ...h.highlights,
    ],
    query,
  );
}

export function useResorts(filters?: ResortListFilters): ResortRecord[] {
  const live = useExperienceCatalogStore((s) => s.resorts);
  return useMemo(() => {
    const source = live.length > 0 ? live : getAllResorts();
    if (!filters) return source;
    return source
      .filter((r) => {
        if (filters.state && r.state !== filters.state) return false;
        if (filters.priceTier && r.priceTier !== filters.priceTier) return false;
        if (filters.region && r.region !== filters.region) return false;
        return resortMatchesQuery(r, filters.query);
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

export function useHolidayPackages(filters?: HolidayListFilters): HolidayPackage[] {
  const live = useExperienceCatalogStore((s) => s.holidays);
  return useMemo(() => {
    const source = live.length > 0 ? live : getAllHolidays();
    if (!filters) return source;
    return source
      .filter((h) => {
        if (
          filters.country &&
          !matchesSearchQuery([h.country, h.destination, h.region], filters.country)
        ) {
          return false;
        }
        if (filters.budgetTier && h.budgetTier !== filters.budgetTier) {
          return false;
        }
        return holidayMatchesQuery(h, filters.query);
      })
      .sort((a, b) => {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        const imgDiff =
          (b.imageUrls.length > 0 ? 1 : 0) - (a.imageUrls.length > 0 ? 1 : 0);
        if (imgDiff !== 0) return imgDiff;
        return a.title.localeCompare(b.title);
      });
  }, [live, filters?.query, filters?.country, filters?.budgetTier]);
}

export function useAllHolidays(): HolidayPackage[] {
  const live = useExperienceCatalogStore((s) => s.holidays);
  return live.length > 0 ? live : getAllHolidays();
}

export function useHolidayMeta(): HolidayCatalogMeta {
  const live = useExperienceCatalogStore((s) => s.holidays);
  // Recompute when live catalog changes; getHolidayCatalogMeta reads store/bundled.
  return useMemo(() => getHolidayCatalogMeta(), [live]);
}

export function useCountryDestinations(): CountryDestination[] {
  const live = useExperienceCatalogStore((s) => s.countries);
  return live.length > 0 ? live : FALLBACK_COUNTRIES;
}

// Keep filter helpers referenced for type parity / tree hints in editors.
void filterResorts;
void filterHolidays;
