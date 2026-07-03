import { cmsFetch } from "./cmsClient";
import {
  SPLASH_BACKGROUND,
  SPLASH_BRAND_TAGLINE,
  SPLASH_BRAND_TITLE,
} from "@/constants/splash";

export type MobileAsset = {
  id: string;
  assetType?: string;
  asset_type?: string;
  title?: string;
  imageUrl?: string;
  image_url?: string;
  deepLink?: string;
  deep_link?: string;
  metadata?: {
    backgroundColor?: string;
    tagline?: string;
    title?: string;
  };
};

type MobileAssetsResponse = {
  assets: MobileAsset[];
  updatedAt?: string;
};

export type SplashConfig = {
  title: string;
  tagline: string;
  backgroundColor: string;
  imageUrl?: string;
  source: string;
};

export async function fetchSplashConfig(
  forceRefresh = false,
): Promise<SplashConfig> {
  const result = await cmsFetch<MobileAssetsResponse>(
    "/api/content/mobile-assets?type=splash",
    { assets: [] },
    { forceRefresh },
  );

  const asset = result.data.assets?.[0];
  if (asset) {
    const meta = asset.metadata ?? {};
    return {
      title: meta.title ?? asset.title ?? SPLASH_BRAND_TITLE,
      tagline: meta.tagline ?? SPLASH_BRAND_TAGLINE,
      backgroundColor: meta.backgroundColor ?? SPLASH_BACKGROUND,
      imageUrl: asset.imageUrl ?? asset.image_url,
      source: result.source,
    };
  }

  return {
    title: SPLASH_BRAND_TITLE,
    tagline: SPLASH_BRAND_TAGLINE,
    backgroundColor: SPLASH_BACKGROUND,
    source: "fallback",
  };
}

export async function fetchMobileAssets(
  type: string,
  forceRefresh = false,
) {
  const result = await cmsFetch<MobileAssetsResponse>(
    `/api/content/mobile-assets?type=${encodeURIComponent(type)}`,
    { assets: [] },
    { forceRefresh },
  );
  return {
    assets: result.data.assets ?? [],
    source: result.source,
  };
}

export async function fetchPromotions(forceRefresh = false) {
  return cmsFetch(
    "/api/content/promotions",
    { popups: [], vendorCampaigns: [] },
    { forceRefresh },
  );
}
