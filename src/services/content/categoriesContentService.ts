import { cmsFetch } from "./cmsClient";
import { DISCOVERY_CATEGORIES } from "@/constants/discoveryCategories";

export type CmsCategory = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  icon_url?: string;
  bannerImageUrl?: string;
  banner_image_url?: string;
  description?: string;
  themeColor?: string;
  theme_color?: string;
  displayPriority?: number;
  display_priority?: number;
  isFeatured?: boolean;
  is_featured?: boolean;
  metadata?: Record<string, unknown>;
};

type CategoriesResponse = {
  categories: CmsCategory[];
  updatedAt?: string;
};

function fallbackCategories(): CmsCategory[] {
  return DISCOVERY_CATEGORIES.map((c, i) => ({
    id: c.id,
    name: c.title,
    slug: c.id,
    description: c.subtitle,
    displayPriority: i,
    isFeatured: i < 3,
    metadata: { services: c.services },
  }));
}

export async function fetchCmsCategories(forceRefresh = false) {
  const result = await cmsFetch<CategoriesResponse>(
    "/api/content/categories",
    { categories: fallbackCategories() },
    { forceRefresh },
  );

  const categories =
    result.data.categories?.length > 0
      ? result.data.categories
      : fallbackCategories();

  return {
    categories,
    updatedAt: result.data.updatedAt,
    source: result.data.categories?.length ? result.source : "fallback",
  };
}
