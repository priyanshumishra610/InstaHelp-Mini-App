import {
  fetchCuelinksOffers,
  initializeCuelinks,
  trackDealEvent,
} from "@/services/cuelinksService";
import type { ShopCategoryId } from "@/constants/shop";
import {
  DEAL_SECTION_CONFIG,
  MOCK_DEALS,
  getMockDealById,
  getMockDealSections,
} from "@/features/deals/data/mockDeals";
import type {
  Deal,
  DealCategoryId,
  DealSection,
  DealsPage,
} from "@/features/deals/types/dealTypes";

const PER_PAGE = 12;

let cachedDeals: Deal[] | null = null;

function dedupeDeals(deals: Deal[]): Deal[] {
  const seen = new Set<string>();
  return deals.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

function sortDeals(deals: Deal[]): Deal[] {
  return [...deals].sort((a, b) => {
    if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
    return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
  });
}

async function loadAllDeals(forceRefresh = false): Promise<{
  deals: Deal[];
  source: "api" | "mock" | "cache";
  error?: string;
}> {
  if (!forceRefresh && cachedDeals?.length) {
    return { deals: cachedDeals, source: "cache" };
  }

  initializeCuelinks();
  const api = await fetchCuelinksOffers({ page: 1, perPage: 60 });

  if (api.ok && api.data.length > 0) {
    cachedDeals = dedupeDeals(sortDeals(api.data));
    return { deals: cachedDeals, source: "api" };
  }

  cachedDeals = MOCK_DEALS;
  return {
    deals: MOCK_DEALS,
    source: "mock",
    error: api.error,
  };
}

export async function fetchDealSections(forceRefresh = false): Promise<{
  sections: DealSection[];
  source: "api" | "mock" | "cache";
  error?: string;
}> {
  const { deals, source, error } = await loadAllDeals(forceRefresh);

  const sections = DEAL_SECTION_CONFIG.map((cfg) => ({
    id: cfg.id,
    title: cfg.title,
    deals: sortDeals(deals.filter(cfg.filter)).slice(
      0,
      cfg.id === "recommended" ? 6 : 8,
    ),
  })).filter((s) => s.deals.length > 0);

  return { sections, source, error };
}

export async function fetchDealsPage(options: {
  page: number;
  categoryId?: DealCategoryId;
  search?: string;
  forceRefresh?: boolean;
}): Promise<DealsPage & { source: "api" | "mock" | "cache"; error?: string }> {
  const { deals, source, error } = await loadAllDeals(options.forceRefresh ?? false);

  let filtered = deals;
  if (options.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    filtered = deals.filter((d) => dealSearchHaystack(d).includes(q));
  } else if (options.categoryId) {
    const cfg = DEAL_SECTION_CONFIG.find((c) => c.id === options.categoryId);
    filtered = cfg ? deals.filter(cfg.filter) : deals;
  }

  const start = (options.page - 1) * PER_PAGE;
  const slice = filtered.slice(start, start + PER_PAGE);

  return {
    deals: slice,
    page: options.page,
    perPage: PER_PAGE,
    hasMore: start + PER_PAGE < filtered.length,
    total: filtered.length,
    source,
    error,
  };
}

export function getDealById(id: string, deals?: Deal[]): Deal | undefined {
  if (deals?.length) return deals.find((d) => d.id === id);
  return getMockDealById(id) ?? cachedDeals?.find((d) => d.id === id);
}

export function getSimilarDeals(current: Deal, allDeals?: Deal[], limit = 6): Deal[] {
  const pool = allDeals ?? cachedDeals ?? MOCK_DEALS;
  return pool
    .filter(
      (d) =>
        d.id !== current.id &&
        (d.categoryId === current.categoryId ||
          d.shopCategoryId === current.shopCategoryId),
    )
    .slice(0, limit);
}

function dealSearchHaystack(deal: Deal): string {
  return `${deal.title} ${deal.brand} ${deal.merchant} ${deal.description} ${deal.categoryId}`.toLowerCase();
}

export function filterDeals(
  deals: Deal[],
  options: {
    category: ShopCategoryId;
    search: string;
  },
): Deal[] {
  const q = options.search.trim().toLowerCase();
  let list = deals;

  if (q) {
    list = list.filter((d) => dealSearchHaystack(d).includes(q));
  } else if (options.category !== "all" && options.category !== "deals-offers") {
    list = list.filter((d) => d.shopCategoryId === options.category);
  }

  return sortDeals(list);
}

export async function searchDeals(query: string): Promise<Deal[]> {
  const { deals } = await loadAllDeals(false);
  return filterDeals(deals, { category: "all", search: query });
}

export function clearDealsCache(): void {
  cachedDeals = null;
}

export async function trackDealImpression(dealId: string, categoryId?: DealCategoryId) {
  await trackDealEvent("deal_impression", { dealId, categoryId });
}

export async function trackDealClick(dealId: string, merchant?: string) {
  await trackDealEvent("deal_click", { dealId, merchant });
}

export async function trackCategoryClick(categoryId: DealCategoryId) {
  await trackDealEvent("category_click", { categoryId });
}

export { getMockDealSections };
