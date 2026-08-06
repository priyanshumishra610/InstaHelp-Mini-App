import holidayMeta from "@/data/holiday-catalog-meta.json";
import holidaysData from "@/data/holidays.json";
import { useExperienceCatalogStore } from "@/store/experienceCatalogStore";
import type { HolidayPackage } from "@/types/experienceCatalog";
import { matchesSearchQuery } from "@/utils/searchMatch";

export type HolidayCatalogMeta = {
  total: number;
  countries: { country: string; count: number }[];
  tiers: { tier: string; count: number }[];
};

const BUNDLED_HOLIDAYS = holidaysData as HolidayPackage[];
const BUNDLED_META = holidayMeta as HolidayCatalogMeta;

function liveHolidays(): HolidayPackage[] {
  return useExperienceCatalogStore.getState().holidays;
}

export function getAllHolidays(): HolidayPackage[] {
  const live = liveHolidays();
  return live.length > 0 ? live : BUNDLED_HOLIDAYS;
}

export function getHolidayCatalogMeta(): HolidayCatalogMeta {
  const live = liveHolidays();
  if (live.length === 0) return BUNDLED_META;

  const countryCounts = new Map<string, number>();
  const tierCounts = new Map<string, number>();
  for (const h of live) {
    if (h.country) {
      countryCounts.set(h.country, (countryCounts.get(h.country) ?? 0) + 1);
    }
    if (h.budgetTier) {
      tierCounts.set(h.budgetTier, (tierCounts.get(h.budgetTier) ?? 0) + 1);
    }
  }

  return {
    total: live.length,
    countries: [...countryCounts.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country)),
    tiers: [...tierCounts.entries()]
      .map(([tier, count]) => ({ tier, count }))
      .sort((a, b) => b.count - a.count || a.tier.localeCompare(b.tier)),
  };
}

export function findHolidayById(id: string): HolidayPackage | undefined {
  const live = liveHolidays();
  const fromLive = live.find((h) => h.id === id);
  if (fromLive) return fromLive;
  return BUNDLED_HOLIDAYS.find((h) => h.id === id);
}

export type HolidayListFilters = {
  query?: string;
  country?: string | null;
  budgetTier?: string | null;
};

function holidayMatchesQuery(item: HolidayPackage, query: string) {
  return matchesSearchQuery(
    [
      item.id,
      item.title,
      item.country,
      item.region,
      item.destination,
      item.theme,
      item.vibe,
      item.tripStyle,
      item.budgetTier,
      item.priceFrom,
      item.duration,
      item.bestMonths,
      item.visaType,
      ...item.highlights,
    ],
    query,
  );
}

export function filterHolidays(filters: HolidayListFilters): HolidayPackage[] {
  return getAllHolidays()
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
      return holidayMatchesQuery(h, filters.query?.trim() ?? "");
    })
    .sort((a, b) => {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      const imgDiff =
        (b.imageUrls.length > 0 ? 1 : 0) - (a.imageUrls.length > 0 ? 1 : 0);
      if (imgDiff !== 0) return imgDiff;
      return a.title.localeCompare(b.title);
    });
}
