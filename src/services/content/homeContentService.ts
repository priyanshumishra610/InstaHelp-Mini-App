import { cmsFetch, trackCmsEvent } from "./cmsClient";
import { WEEKLY_OFFERS } from "@/constants/weeklyOffers";
import type { WeeklyOffer, WeeklyOffersResponse } from "@/types/offers";

type CmsBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  image_url?: string;
  ctaText?: string;
  cta_text?: string;
  deepLink?: string;
  deep_link?: string;
  ctaUrl?: string;
  cta_url?: string;
};

const DEFAULT_GRADIENTS: readonly [string, string][] = [
  ["#f8fafc", "#e8f0fc"],
  ["#fafaf9", "#f3f0ea"],
  ["#fafbfc", "#eef1f8"],
  ["#f0fdf4", "#dcfce7"],
];

const ICONS = [
  "home-outline",
  "briefcase-outline",
  "code-slash-outline",
  "sparkles-outline",
] as const;

function mapBannerToOffer(banner: CmsBanner, index: number): WeeklyOffer {
  const imageUrl = banner.imageUrl ?? banner.image_url ?? "";
  const gradient = DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle ?? "",
    cta: banner.ctaText ?? banner.cta_text ?? "Explore",
    gradient,
    icon: ICONS[index % ICONS.length],
    image: imageUrl ? { uri: imageUrl } : undefined,
    action: banner.deepLink ?? banner.deep_link ?? banner.ctaUrl ?? banner.cta_url,
  };
}

type HomeContentResponse = {
  banners: CmsBanner[];
  featured: unknown[];
  sections: unknown[];
  updatedAt?: string;
};

export async function fetchWeeklyOffers(
  forceRefresh = false,
): Promise<WeeklyOffersResponse & { source: string }> {
  const fallback: HomeContentResponse = {
    banners: [],
    featured: [],
    sections: [],
  };

  const result = await cmsFetch<HomeContentResponse>(
    "/api/content/home",
    fallback,
    { forceRefresh },
  );

  const banners = result.data.banners ?? [];
  const offers =
    banners.length > 0
      ? banners.map(mapBannerToOffer)
      : WEEKLY_OFFERS;

  return {
    offers,
    updatedAt: result.data.updatedAt ?? new Date().toISOString(),
    source: banners.length > 0 ? result.source : "fallback",
  };
}

export async function fetchHomeBanners(forceRefresh = false) {
  const result = await cmsFetch<{ banners: CmsBanner[]; updatedAt?: string }>(
    "/api/content/banners",
    { banners: [] },
    { forceRefresh },
  );
  return {
    banners: result.data.banners ?? [],
    source: result.source,
  };
}

export function trackBannerClick(bannerId: string): void {
  trackCmsEvent("banner_click", "banners", bannerId);
}
