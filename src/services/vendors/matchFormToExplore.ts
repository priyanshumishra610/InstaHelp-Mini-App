import {
  ALL_DISCOVERY_SERVICES,
  findCategoryForService,
} from "@/constants/discoveryCategories";
import type { DiscoveryService } from "@/types/discovery";
import { getVendorCatalog } from "./getVendorCatalog";
import { vendorMatchesSearch } from "./vendorQueryHelpers";

export type ExploreFormSuggestion = {
  /** Primary label shown to the user (e.g. "Plumber") */
  label: string;
  /** Discovery category title when available */
  categoryTitle: string | null;
  /** Related discovery service labels (excluding primary) */
  relatedLabels: string[];
  /** Vendors matched in Explore for the primary search term */
  vendorCount: number;
  /** Route param for Explore search */
  search: string;
};

/** Preferred Explore search terms for home form service picker values. */
const FORM_SERVICE_SEARCH: Record<string, string[]> = {
  cleaning: ["House Cleaning", "Deep Cleaning", "cleaning"],
  plumbing: ["Plumber", "plumbing"],
  electrician: ["Electrician"],
  painting: ["Painting", "painter"],
  ac_repair: ["AC Servicing", "AC"],
  cctv: ["CCTV"],
  carpenter: ["Carpenter"],
  repair: ["Handyman", "repair"],
  moving: ["Packers & Movers", "movers"],
  pest_control: ["Pest Control"],
  appliance_repair: ["Appliance Repair"],
  real_estate: ["Real estate"],
  doctor: ["clinic", "doctor"],
  car_wash: ["Car Wash"],
  laundry: ["laundry", "dry clean"],
  local_shop: ["local shop"],
  driver: ["driver"],
  tutor: ["Tutor", "Tuition"],
  salon: ["Salon", "Makeup Artist"],
  errand: ["errand", "courier"],
};

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function uniqueLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const key = normalize(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label.trim());
  }
  return out;
}

function discoveryMatchesForFormService(
  serviceType: string,
): DiscoveryService[] {
  if (!serviceType || serviceType === "custom") return [];
  return ALL_DISCOVERY_SERVICES.filter((s) => s.formServiceId === serviceType);
}

function discoveryMatchesForText(text: string): DiscoveryService[] {
  const lower = normalize(text);
  if (lower.length < 3) return [];

  const scored: { service: DiscoveryService; score: number }[] = [];

  for (const service of ALL_DISCOVERY_SERVICES) {
    const label = normalize(service.label);
    if (!label) continue;

    let score = 0;
    if (lower.includes(label) || label.includes(lower)) {
      score = 100 + label.length;
    } else {
      const words = label.split(/\s+/).filter((w) => w.length >= 4);
      const hitCount = words.filter((w) => lower.includes(w)).length;
      if (hitCount === 0) continue;
      score = hitCount * 20 + (hitCount === words.length ? 30 : 0);
    }

    if (service.popular) score += 8;
    if (service.recommended) score += 5;
    scored.push({ service, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.service);
}

function countVendorsForSearch(search: string): number {
  const q = search.trim();
  if (!q) return 0;
  const rows = getVendorCatalog().getAll();
  let count = 0;
  for (const v of rows) {
    if (vendorMatchesSearch(v, q)) count += 1;
  }
  return count;
}

function pickBestSearchTerm(candidates: string[]): {
  search: string;
  vendorCount: number;
} {
  let best = { search: "", vendorCount: 0 };
  for (const term of candidates) {
    const vendorCount = countVendorsForSearch(term);
    if (vendorCount > best.vendorCount) {
      best = { search: term, vendorCount };
    }
    // Good enough — avoid scanning every synonym when we already have listings
    if (vendorCount >= 10) break;
  }
  if (!best.search && candidates[0]) {
    return { search: candidates[0], vendorCount: 0 };
  }
  return best;
}

/**
 * Suggest Explore listings when the home form service/description
 * matches a discovery service or vendor category we already carry.
 */
export function matchFormToExplore(input: {
  serviceType: string;
  serviceLabel?: string;
  description: string;
}): ExploreFormSuggestion | null {
  const serviceType = input.serviceType.trim();
  const description = input.description.trim();

  if (!serviceType && description.length < 3) return null;

  const fromForm = discoveryMatchesForFormService(serviceType);
  const fromText = discoveryMatchesForText(description);

  // Prefer form-service matches; fall back to description matches
  const primaryPool = fromForm.length > 0 ? fromForm : fromText;
  if (primaryPool.length === 0 && serviceType === "custom" && fromText.length === 0) {
    return null;
  }

  const primary = primaryPool[0];
  const related = uniqueLabels(
    [...fromForm, ...fromText]
      .map((s) => s.label)
      .filter((label) => !primary || normalize(label) !== normalize(primary.label)),
  ).slice(0, 3);

  const formTerms = FORM_SERVICE_SEARCH[serviceType] ?? [];
  const labelTerms = [
    primary?.label,
    input.serviceLabel,
    ...formTerms,
    ...fromForm.map((s) => s.label),
    ...fromText.slice(0, 3).map((s) => s.label),
  ].filter((t): t is string => Boolean(t && t.trim()));

  const candidates = uniqueLabels(labelTerms);
  if (candidates.length === 0) return null;

  const { search, vendorCount } = pickBestSearchTerm(candidates);

  // Show when we have Explore vendors, or a clear discovery match to browse
  if (vendorCount === 0 && !primary) return null;

  const category = primary ? findCategoryForService(primary.id) : undefined;
  const label = primary?.label ?? search;

  return {
    label,
    categoryTitle: category?.title ?? null,
    relatedLabels: related,
    vendorCount,
    search,
  };
}
