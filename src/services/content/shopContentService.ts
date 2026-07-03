import { cmsFetch } from "./cmsClient";
import { SHOP_CATEGORIES } from "@/constants/shop";

export type CmsShopCategory = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  icon_url?: string;
  bannerUrl?: string;
  banner_url?: string;
  promoBannerUrl?: string;
  promo_banner_url?: string;
  displayPriority?: number;
  display_priority?: number;
};

type ShopResponse = {
  categories: CmsShopCategory[];
  updatedAt?: string;
};

function fallbackShopCategories(): CmsShopCategory[] {
  return SHOP_CATEGORIES.map((c, i) => ({
    id: c.id,
    name: c.label,
    slug: c.id,
    displayPriority: i,
  }));
}

export async function fetchCmsShopContent(forceRefresh = false) {
  const result = await cmsFetch<ShopResponse>(
    "/api/content/shop",
    { categories: fallbackShopCategories() },
    { forceRefresh },
  );

  const categories =
    result.data.categories?.length > 0
      ? result.data.categories
      : fallbackShopCategories();

  return {
    categories,
    updatedAt: result.data.updatedAt,
    source: result.data.categories?.length ? result.source : "fallback",
  };
}
