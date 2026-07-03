export const SHOP_CATEGORIES = [
  { id: "all", label: "All", icon: "grid-outline" as const },
  {
    id: "electronics",
    label: "Electronics",
    icon: "hardware-chip-outline" as const,
  },
  { id: "fashion", label: "Fashion", icon: "shirt-outline" as const },
  {
    id: "home-kitchen",
    label: "Home & Kitchen",
    icon: "home-outline" as const,
  },
  { id: "beauty", label: "Beauty", icon: "sparkles-outline" as const },
  { id: "sports", label: "Sports", icon: "football-outline" as const },
  { id: "books", label: "Books", icon: "book-outline" as const },
  {
    id: "toys-games",
    label: "Toys & Games",
    icon: "game-controller-outline" as const,
  },
  { id: "grocery", label: "Grocery", icon: "basket-outline" as const },
  { id: "automotive", label: "Automotive", icon: "car-outline" as const },
  {
    id: "office-supplies",
    label: "Office Supplies",
    icon: "briefcase-outline" as const,
  },
  {
    id: "deals-offers",
    label: "Deals & Offers",
    icon: "pricetags-outline" as const,
  },
] as const;

export type ShopCategoryId = (typeof SHOP_CATEGORIES)[number]["id"];

export const SHOP_SEARCH_PLACEHOLDERS = [
  "Search electronics",
  "Search fashion",
  "Search grocery",
  "Search beauty",
] as const;
