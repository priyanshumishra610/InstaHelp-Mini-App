import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import {
  CUELINKS_API_TOKEN,
  CUELINKS_CHANNEL_ID,
  CUELINKS_IS_CONFIGURED,
  CUELINKS_PUBLISHER_ID,
  CUELINKS_TRACKING_READY,
} from "@/config/env";
import type {
  Deal,
  DealAnalyticsEvent,
  DealAnalyticsPayload,
  DealCategoryId,
} from "@/features/deals/types/dealTypes";

const API_BASE = "https://www.cuelinks.com/api/v2";
const CONVERT_API = "https://developers.cuelinks.com/pub_api/v3/links/convert";
/** Web script (`cuelinksv2.js`) redirect host with `var cId = '284356'` */
const LINKS_REDIRECT = "https://linksredirect.com/";
const ANALYTICS_KEY = "instahelp-deals-analytics";
const MAX_EVENTS = 500;
const REQUEST_TIMEOUT_MS = 12_000;

const TRACKING_HOSTS = new Set([
  "linksredirect.com",
  "www.linksredirect.com",
  "clnk.in",
  "affiliates.tyroodr.com",
  "track.in.omgpm.com",
  "www.s2d6.com",
]);

export type CuelinksInitStatus = {
  configured: boolean;
  trackingReady: boolean;
  publisherId: string;
  channelId: string;
  initialized: boolean;
};

export type CuelinksWrapOptions = {
  subid?: string;
  subid2?: string;
  subid3?: string;
  source?: string;
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

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isCuelinksTrackingUrl(url: string): boolean {
  const host = hostnameOf(url);
  if (!host) return false;
  if (TRACKING_HOSTS.has(host)) return true;
  return host.endsWith(".clnk.in") || host.endsWith(".linksredirect.com");
}

/**
 * Mirrors web `cuelinksv2.js` with `var cId = '284356'`:
 * https://linksredirect.com/?cid=284356&url=…&source=…
 */
export function buildCuelinksTrackingUrl(
  destinationUrl: string,
  options?: CuelinksWrapOptions,
): string {
  const trimmed = destinationUrl.trim();
  if (!trimmed) return trimmed;
  if (isCuelinksTrackingUrl(trimmed)) return trimmed;
  if (!CUELINKS_TRACKING_READY) return trimmed;

  const params = new URLSearchParams();
  params.set("cid", CUELINKS_CHANNEL_ID);
  if (options?.subid) params.set("subid", options.subid);
  if (options?.subid2) params.set("subid2", options.subid2);
  if (options?.subid3) params.set("subid3", options.subid3);
  params.set("source", options?.source ?? "app");
  params.set("url", trimmed);
  return `${LINKS_REDIRECT}?${params.toString()}`;
}

/**
 * Prefer Publisher API convert when token exists; otherwise wrap with cid.
 * @see https://developers.cuelinks.com/docs/reference/links/convert
 */
export async function resolveCuelinksUrl(
  destinationUrl: string,
  options?: CuelinksWrapOptions,
): Promise<string> {
  const trimmed = destinationUrl.trim();
  if (!trimmed) return trimmed;
  if (isCuelinksTrackingUrl(trimmed)) return trimmed;

  if (CUELINKS_IS_CONFIGURED) {
    try {
      const body: Record<string, unknown> = {
        url: trimmed,
        channel_id: Number(CUELINKS_CHANNEL_ID) || undefined,
        shorten: false,
      };
      if (options?.subid) body.subid = options.subid;
      if (options?.subid2) body.subid2 = options.subid2;
      if (options?.subid3) body.subid3 = options.subid3;

      const response = await fetchWithTimeout(CONVERT_API, {
        method: "POST",
        headers: {
          Authorization: `Token ${CUELINKS_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const json = (await response.json()) as {
          data?: { tracking_url?: string; short_url?: string };
          tracking_url?: string;
        };
        const tracking =
          json.data?.tracking_url?.trim() ||
          json.data?.short_url?.trim() ||
          json.tracking_url?.trim();
        if (tracking) return tracking;
      }
    } catch {
      // Fall through to client-side cid wrap.
    }
  }

  return buildCuelinksTrackingUrl(trimmed, options);
}

export function initializeCuelinks(): CuelinksInitStatus {
  initialized = true;
  return {
    configured: CUELINKS_IS_CONFIGURED,
    trackingReady: CUELINKS_TRACKING_READY,
    publisherId: CUELINKS_PUBLISHER_ID,
    channelId: CUELINKS_CHANNEL_ID,
    initialized: true,
  };
}

export function getCuelinksStatus(): CuelinksInitStatus {
  return {
    configured: CUELINKS_IS_CONFIGURED,
    trackingReady: CUELINKS_TRACKING_READY,
    publisherId: CUELINKS_PUBLISHER_ID,
    channelId: CUELINKS_CHANNEL_ID,
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
    const tracked = await resolveCuelinksUrl(trimmed, {
      subid: dealId,
      subid2: Platform.OS,
      subid3: "deals",
      source: "app",
    });
    await trackDealEvent("affiliate_redirect", { dealId });
    await WebBrowser.openBrowserAsync(tracked, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      enableBarCollapsing: true,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "open_failed" };
  }
}

/** Open merchant URLs through CueLinks (shop store tiles). */
export async function openCuelinksTrackedUrl(
  url: string,
  options?: CuelinksWrapOptions & { analyticsId?: string },
): Promise<{ ok: boolean; error?: string; trackedUrl?: string }> {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, error: "empty" };

  try {
    const tracked = await resolveCuelinksUrl(trimmed, {
      subid: options?.subid,
      subid2: options?.subid2 ?? Platform.OS,
      subid3: options?.subid3 ?? "shop",
      source: options?.source ?? "app",
    });
    if (options?.analyticsId) {
      await trackDealEvent("affiliate_redirect", {
        dealId: options.analyticsId,
      });
    }
    await WebBrowser.openBrowserAsync(tracked, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      enableBarCollapsing: true,
    });
    return { ok: true, trackedUrl: tracked };
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
    channelId: CUELINKS_CHANNEL_ID || undefined,
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
