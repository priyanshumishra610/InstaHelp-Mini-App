import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

import {
  CUELINKS_API_TOKEN,
  CUELINKS_IS_CONFIGURED,
  CUELINKS_PUBLISHER_ID,
} from "@/config/env";
import type {
  Deal,
  DealAnalyticsEvent,
  DealAnalyticsPayload,
  DealCategoryId,
} from "@/features/deals/types/dealTypes";

const API_BASE = "https://www.cuelinks.com/api/v2";
const ANALYTICS_KEY = "instahelp-deals-analytics";
const MAX_EVENTS = 500;
const REQUEST_TIMEOUT_MS = 12_000;

export type CuelinksInitStatus = {
  configured: boolean;
  publisherId: string;
  initialized: boolean;
};

export type CuelinksFetchResult<T> = {
  ok: boolean;
  data: T;
  source: "api" | "cache" | "offline";
  error?: string;
};

type CuelinksOfferRaw = {
  id?: number | string;
  title?: string;
  description?: string;
  coupon_code?: string;
  offer_type?: string;
  affiliate_url?: string;
  landing_page_url?: string;
  image_url?: string;
  merchant?: {
    id?: number;
    name?: string;
    logo_url?: string;
  };
  categories?: { id?: number; name?: string }[];
  discount?: string;
  cashback?: string;
};

type CuelinksOffersResponse = {
  offers?: CuelinksOfferRaw[];
  data?: CuelinksOfferRaw[];
  total?: number;
  page?: number;
  per_page?: number;
};

let initialized = false;

const CATEGORY_MAP: Record<string, DealCategoryId> = {
  electronics: "electronics",
  fashion: "fashion",
  travel: "travel",
  grocery: "grocery",
  food: "grocery",
  cashback: "cashback",
  festival: "festival",
  credit: "credit-card",
};

function inferCategory(raw: CuelinksOfferRaw): DealCategoryId {
  const names = (raw.categories ?? [])
    .map((c) => c.name?.toLowerCase() ?? "")
    .join(" ");
  for (const [key, id] of Object.entries(CATEGORY_MAP)) {
    if (names.includes(key)) return id;
  }
  if (raw.offer_type?.toLowerCase().includes("cashback")) return "cashback";
  return "best-offers";
}

function inferShopCategory(categoryId: DealCategoryId): Deal["shopCategoryId"] {
  if (categoryId === "fashion") return "fashion";
  if (categoryId === "grocery") return "grocery";
  if (categoryId === "travel") return "automotive";
  if (categoryId === "electronics" || categoryId === "festival" || categoryId === "credit-card" || categoryId === "cashback" || categoryId === "best-offers") {
    return "electronics";
  }
  return "electronics";
}

function parsePercent(value?: string | number | null): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? Math.round(Number(match[1])) : null;
}

function mapOfferToDeal(raw: CuelinksOfferRaw, index: number): Deal | null {
  const title = raw.title?.trim();
  const affiliateUrl = raw.affiliate_url?.trim() || raw.landing_page_url?.trim();
  if (!title || !affiliateUrl) return null;

  const categoryId = inferCategory(raw);
  const merchant = raw.merchant?.name?.trim() || "Partner Store";
  const imageUrl = raw.image_url?.trim() || raw.merchant?.logo_url?.trim() || "";

  return {
    id: `cuelinks-${raw.id ?? index}`,
    title,
    brand: merchant,
    merchant,
    categoryId,
    shopCategoryId: inferShopCategory(categoryId),
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : [],
    description: raw.description?.trim() || title,
    currentPrice: null,
    originalPrice: null,
    discountPercent: parsePercent(raw.discount),
    cashbackPercent: parsePercent(raw.cashback),
    cashbackLabel: raw.cashback?.trim() || undefined,
    affiliateUrl,
    badge: "Partner Offer",
    isTrending: index < 6,
    sortPriority: index + 1,
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function initializeCuelinks(): CuelinksInitStatus {
  initialized = true;
  return {
    configured: CUELINKS_IS_CONFIGURED,
    publisherId: CUELINKS_PUBLISHER_ID,
    initialized: true,
  };
}

export function getCuelinksStatus(): CuelinksInitStatus {
  return {
    configured: CUELINKS_IS_CONFIGURED,
    publisherId: CUELINKS_PUBLISHER_ID,
    initialized,
  };
}

export async function fetchCuelinksOffers(options?: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
}): Promise<CuelinksFetchResult<Deal[]>> {
  if (!CUELINKS_IS_CONFIGURED) {
    return { ok: false, data: [], source: "offline", error: "not_configured" };
  }

  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 30;
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    country_id: "1",
  });
  if (options?.category) params.set("category", options.category);
  if (options?.search) params.set("search_term", options.search);

  const url = `${API_BASE}/offers.json?${params.toString()}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Authorization: `Token token="${CUELINKS_API_TOKEN}"`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        data: [],
        source: "api",
        error: `http_${response.status}`,
      };
    }

    const json = (await response.json()) as CuelinksOffersResponse;
    const rows = json.offers ?? json.data ?? [];
    const deals = rows
      .map((row, i) => mapOfferToDeal(row, i))
      .filter((d): d is Deal => d != null);

    return { ok: true, data: deals, source: "api" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch_failed";
    return { ok: false, data: [], source: "offline", error: message };
  }
}

export async function fetchCuelinksCampaigns(options?: {
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<CuelinksFetchResult<Deal[]>> {
  if (!CUELINKS_IS_CONFIGURED) {
    return { ok: false, data: [], source: "offline", error: "not_configured" };
  }

  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 30;
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    sort_column: "id",
    sort_direction: "asc",
    country_id: "1",
  });
  if (options?.search) params.set("search_term", options.search);

  const url = `${API_BASE}/campaigns.json?${params.toString()}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Authorization: `Token token="${CUELINKS_API_TOKEN}"`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        data: [],
        source: "api",
        error: `http_${response.status}`,
      };
    }

    const json = (await response.json()) as {
      campaigns?: Array<{
        id?: number;
        name?: string;
        description?: string;
        affiliate_url?: string;
        logo_url?: string;
        merchant?: { name?: string };
      }>;
    };

    const deals: Deal[] = (json.campaigns ?? [])
      .map((c, i) => {
        const title = c.name?.trim();
        const affiliateUrl = c.affiliate_url?.trim();
        if (!title || !affiliateUrl) return null;
        const merchant = c.merchant?.name?.trim() || title;
        const imageUrl = c.logo_url?.trim() || "";
        return {
          id: `cuelinks-campaign-${c.id ?? i}`,
          title,
          brand: merchant,
          merchant,
          categoryId: "best-offers" as DealCategoryId,
          shopCategoryId: "electronics" as Deal["shopCategoryId"],
          imageUrl,
          imageUrls: imageUrl ? [imageUrl] : [],
          description: c.description?.trim() || title,
          currentPrice: null,
          originalPrice: null,
          discountPercent: null,
          cashbackPercent: null,
          affiliateUrl,
          badge: "Partner Offer",
          sortPriority: i + 1,
        } satisfies Deal;
      })
      .filter((d): d is Deal => d != null);

    return { ok: true, data: deals, source: "api" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch_failed";
    return { ok: false, data: [], source: "offline", error: message };
  }
}

export async function openCuelinksAffiliateLink(
  url: string,
  dealId: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, error: "empty" };

  try {
    await trackDealEvent("affiliate_redirect", { dealId });
    await WebBrowser.openBrowserAsync(trimmed, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      enableBarCollapsing: true,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "open_failed" };
  }
}

export async function trackDealEvent(
  event: DealAnalyticsEvent,
  payload: Omit<DealAnalyticsPayload, "timestamp">,
): Promise<void> {
  const entry = {
    event,
    ...payload,
    timestamp: new Date().toISOString(),
    publisherId: CUELINKS_PUBLISHER_ID || undefined,
  };

  try {
    const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    await AsyncStorage.setItem(
      ANALYTICS_KEY,
      JSON.stringify(list.slice(0, MAX_EVENTS)),
    );
  } catch {
    // Analytics is best-effort.
  }
}
