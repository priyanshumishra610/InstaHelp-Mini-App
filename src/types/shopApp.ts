import type { ShopCategoryId } from "@/constants/shop";

export type AppCategoryId =
  | "travel"
  | "food"
  | "grocery"
  | "finance"
  | "entertainment"
  | "education"
  | "healthcare"
  | "logistics"
  | "real-estate"
  | "beauty";

export type ShopApp = {
  id: string;
  name: string;
  appCategoryId: AppCategoryId;
  shopCategoryId: Exclude<ShopCategoryId, "all">;
  logoUrl: string;
  bannerUrls: string[];
  description: string;
  features: string[];
  websiteUrl: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  isTrending?: boolean;
  isNew?: boolean;
  sortPriority: number;
};

export type ShopGridItem =
  | { kind: "product"; product: import("@/types/shopCatalog").ShopCatalogProduct }
  | { kind: "app"; app: ShopApp };
