import {
  HUBBLE_CONFIG,
  HUBBLE_IS_CONFIGURED,
  HUBBLE_WRAP_PLATFORM,
} from "@/integrations/hubble";

export { HUBBLE_IS_CONFIGURED, HUBBLE_WRAP_PLATFORM };
export const HUBBLE_CLIENT_ID = HUBBLE_CONFIG.clientId;
export const HUBBLE_APP_SECRET = HUBBLE_CONFIG.appSecret;
export const HUBBLE_ENV = HUBBLE_CONFIG.environment;
export const HUBBLE_ANALYTICS_ENABLED = HUBBLE_CONFIG.analyticsEnabled;
export const HUBBLE_DEMO_BRAND_IDS = HUBBLE_CONFIG.demoBrandIds;

export type GiftCardCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: "restaurant" | "shopping-bag" | "film" | "fitness" | "airplane" | "cafe";
  searchCategory?: string;
};

export const GIFT_CARD_CATEGORIES: GiftCardCategory[] = [
  {
    id: "food",
    title: "Food & dining",
    subtitle: "Restaurants & delivery",
    icon: "restaurant",
    searchCategory: "food",
  },
  {
    id: "shopping",
    title: "Shopping",
    subtitle: "Retail & marketplaces",
    icon: "shopping-bag",
    searchCategory: "shopping",
  },
  {
    id: "entertainment",
    title: "Entertainment",
    subtitle: "Streaming & tickets",
    icon: "film",
    searchCategory: "entertainment",
  },
  {
    id: "wellness",
    title: "Wellness",
    subtitle: "Fitness & self-care",
    icon: "fitness",
    searchCategory: "wellness",
  },
  {
    id: "travel",
    title: "Travel",
    subtitle: "Stays & experiences",
    icon: "airplane",
    searchCategory: "travel",
  },
  {
    id: "coffee",
    title: "Coffee & treats",
    subtitle: "Cafés & desserts",
    icon: "cafe",
    searchCategory: "food",
  },
];

export type GiftCardHeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  accent: string;
  /** SDK route path (e.g. search, transactions, help) */
  sdkPath: string;
  searchCategory?: string;
};

export const GIFT_CARD_HERO_SLIDES: GiftCardHeroSlide[] = [
  {
    id: "h1",
    title: "Curated gift cards",
    subtitle: "Pick a brand, pay securely, send instantly.",
    cta: "Browse brands",
    accent: "#004aad",
    sdkPath: "search",
  },
  {
    id: "h2",
    title: "Cashback that stacks",
    subtitle: "Unlock offers as you shop partner brands.",
    cta: "View offers",
    accent: "#b45309",
    sdkPath: "search",
    searchCategory: "shopping",
  },
  {
    id: "h3",
    title: "Your wallet, upgraded",
    subtitle: "Track purchases and redemptions in one place.",
    cta: "Open wallet",
    accent: "#0f766e",
    sdkPath: "transactions",
  },
];

export type GiftCardFeatured = {
  id: string;
  name: string;
  tagline: string;
  cashbackLabel?: string;
  /** Partner catalog brand id when known */
  brandId?: string;
};

export const GIFT_CARD_FEATURED: GiftCardFeatured[] = [
  {
    id: "f1",
    name: "Everyday essentials",
    tagline: "Groceries, delivery, daily wins",
    cashbackLabel: "Up to 4% back",
    brandId: HUBBLE_DEMO_BRAND_IDS[0],
  },
  {
    id: "f2",
    name: "Premium picks",
    tagline: "Fashion, tech, lifestyle",
    cashbackLabel: "Limited offers",
    brandId: HUBBLE_DEMO_BRAND_IDS[1],
  },
  {
    id: "f3",
    name: "Experiences",
    tagline: "Dining, travel, fun nights out",
    brandId: HUBBLE_DEMO_BRAND_IDS[2],
  },
];

export type GiftCardBrandTile = {
  id: string;
  name: string;
  initials: string;
  brandId?: string;
};

export const GIFT_CARD_POPULAR_BRANDS: GiftCardBrandTile[] = [
  { id: "b1", name: "Partner A", initials: "PA", brandId: HUBBLE_DEMO_BRAND_IDS[0] },
  { id: "b2", name: "Partner B", initials: "PB", brandId: HUBBLE_DEMO_BRAND_IDS[1] },
  { id: "b3", name: "Partner C", initials: "PC", brandId: HUBBLE_DEMO_BRAND_IDS[2] },
  { id: "b4", name: "Partner D", initials: "PD", brandId: HUBBLE_DEMO_BRAND_IDS[3] },
  { id: "b5", name: "Partner E", initials: "PE", brandId: HUBBLE_DEMO_BRAND_IDS[4] },
  { id: "b6", name: "Partner F", initials: "PF", brandId: HUBBLE_DEMO_BRAND_IDS[5] },
];
