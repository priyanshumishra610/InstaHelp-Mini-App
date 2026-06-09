import type { ShopProductCategoryId } from "@/constants/shopMockProducts";

export type ShopPlatform = "amazon" | "flipkart" | "myntra" | "meesho";

export type ShopPlatformOffer = {
  platform: ShopPlatform;
  platformLabel: string;
  price: number | null;
  affiliateUrl: string | null;
};

export type ShopCatalogProduct = {
  id: string;
  title: string;
  categoryId: ShopProductCategoryId;
  subCategory?: string;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  highlights: string[];
  badge?: string;
  brand?: string;
  stock: string;
  rating: number;
  reviewCount: number;
  sortPriority: number | null;
  sheetOnDiscount: boolean | null;
  sheetInStock: boolean | null;
  platforms: ShopPlatformOffer[];
  bestPrice: number | null;
  bestPlatform: ShopPlatform | null;
  maxPrice: number | null;
  savingsAmount: number | null;
  savingsPercent: number | null;
};

export type ShopCatalogCache = {
  products: ShopCatalogProduct[];
  last_fetched_at: string | null;
  sheet_last_updated: string | null;
  csv_fingerprint: string | null;
  cache_version: 1;
};

export type AffiliateTapLog = {
  product_id: string;
  platform: ShopPlatform;
  timestamp: string;
};
