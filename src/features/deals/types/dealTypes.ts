import type { ShopCategoryId } from "@/constants/shop";

export type DealCategoryId =
  | "trending"
  | "best-offers"
  | "cashback"
  | "electronics"
  | "fashion"
  | "travel"
  | "grocery"
  | "credit-card"
  | "festival"
  | "recommended";

export type Deal = {
  id: string;
  title: string;
  brand: string;
  merchant: string;
  categoryId: DealCategoryId;
  shopCategoryId: Exclude<ShopCategoryId, "all" | "deals-offers">;
  imageUrl: string;
  imageUrls: string[];
  description: string;
  currentPrice: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  cashbackPercent: number | null;
  cashbackLabel?: string;
  affiliateUrl: string;
  badge?: string;
  isTrending?: boolean;
  isSponsored?: boolean;
  sortPriority: number;
};

export type DealSection = {
  id: DealCategoryId;
  title: string;
  deals: Deal[];
};

export type DealsPage = {
  deals: Deal[];
  page: number;
  perPage: number;
  hasMore: boolean;
  total?: number;
};

export type DealAnalyticsEvent =
  | "deal_impression"
  | "deal_click"
  | "category_click"
  | "affiliate_redirect"
  | "conversion";

export type DealAnalyticsPayload = {
  dealId?: string;
  categoryId?: DealCategoryId;
  merchant?: string;
  timestamp: string;
};
