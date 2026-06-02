import resortMeta from "@/data/resort-catalog-meta.json";
import resortsData from "@/data/resorts.json";
import type { ResortCatalogMeta, ResortRecord } from "@/types/resortExperience";

const RESORTS = resortsData as ResortRecord[];
const META = resortMeta as ResortCatalogMeta;

export function getAllResorts(): ResortRecord[] {
  return RESORTS;
}

export function getResortCatalogMeta(): ResortCatalogMeta {
  return META;
}

export function findResortById(id: string): ResortRecord | undefined {
  return RESORTS.find((r) => r.id === id);
}

export type ResortListFilters = {
  query?: string;
  state?: string | null;
  priceTier?: string | null;
  region?: string | null;
};

function resortSortKey(r: ResortRecord): number {
  if (r.rank != null && r.rank > 0) return r.rank;
  return 9999;
}

export function filterResorts(filters: ResortListFilters): ResortRecord[] {
  const q = filters.query?.trim().toLowerCase();
  return RESORTS.filter((r) => {
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
  }).sort((a, b) => {
    const rankDiff = resortSortKey(a) - resortSortKey(b);
    if (rankDiff !== 0) return rankDiff;
    const imgDiff = (b.imageUrls.length > 0 ? 1 : 0) - (a.imageUrls.length > 0 ? 1 : 0);
    if (imgDiff !== 0) return imgDiff;
    return a.name.localeCompare(b.name);
  });
}
