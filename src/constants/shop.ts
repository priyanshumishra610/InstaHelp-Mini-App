export const SHOP_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "electronics", label: "Electronics" },
  { id: "beauty", label: "Beauty" },
  { id: "travel", label: "Travel" },
  { id: "gaming", label: "Gaming" },
  { id: "fashion", label: "Fashion" },
  { id: "decor", label: "Decor" },
  { id: "gifts", label: "Gifts" },
] as const;

export type ShopCategoryId = (typeof SHOP_CATEGORIES)[number]["id"];

export const SHOP_SEARCH_PLACEHOLDERS = [
  "Search electronics",
  "Search beauty",
  "Search gifts",
  "Search gadgets",
] as const;
