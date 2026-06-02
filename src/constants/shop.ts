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

export const FLIPKART_WIDGET_SCRIPT =
  "https://affiliate.flipkart.com/affiliate/widgets/FKAffiliateWidgets.js";

export const FLIPKART_SEARCH_WIDGET = {
  wrid: "WRID-143512974042930177",
  widgetType: "searchWidget",
  height: 250,
  width: 300,
} as const;

export const FLIPKART_BANNER_WIDGET = {
  wrid: "WRID-177859445145299748",
  widgetType: "Push Content",
  height: 90,
  width: 728,
} as const;
