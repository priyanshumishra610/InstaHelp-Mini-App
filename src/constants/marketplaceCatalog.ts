import META from "@/data/vendor-catalog-meta.json";

export type MarketplaceCityOption = {
  id: string;
  label: string;
  count: number;
};

export type MarketplaceAreaOption = {
  id: string;
  label: string;
  cityLabel: string;
  count: number;
};

/** Top cities & areas from the full vendor CSV (see `npm run build:vendors`). */
export const MARKETPLACE_CITIES: MarketplaceCityOption[] = META.cities;
export const MARKETPLACE_AREAS: MarketplaceAreaOption[] = META.areas;
export const MARKETPLACE_TOTAL_VENDORS: number = META.totalVendors;
