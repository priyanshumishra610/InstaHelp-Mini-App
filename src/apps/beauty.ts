import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const BEAUTY_APPS: ShopApp[] = [
  createApp({
    id: "app-lakme-salon",
    name: "Lakme Salon",
    appCategoryId: "beauty",
    shopCategoryId: "beauty",
    description:
      "Book salon appointments for hair, skin, and beauty services at Lakme salons near you.",
    features: ["Salon booking", "Hair styling", "Skin treatments", "Beauty packages"],
    websiteUrl: "https://www.lakmesalon.in/",
    rating: 4.2,
    reviewCount: 180000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-naturals",
    name: "Naturals",
    appCategoryId: "beauty",
    shopCategoryId: "beauty",
    description:
      "India's largest salon chain offering affordable hair, skin, and bridal beauty services.",
    features: ["Affordable services", "Bridal packages", "Hair care", "Skin care"],
    websiteUrl: "https://www.naturalssalon.com/",
    rating: 4.1,
    reviewCount: 140000,
    sortPriority: 2,
  }),
  createApp({
    id: "app-vlcc",
    name: "VLCC",
    appCategoryId: "beauty",
    shopCategoryId: "beauty",
    description:
      "Wellness and beauty services including slimming, skin care, and grooming treatments.",
    features: ["Slimming treatments", "Skin care", "Grooming", "Wellness programs"],
    websiteUrl: "https://www.vlccwellness.com/",
    rating: 4.0,
    reviewCount: 120000,
    isNew: true,
    sortPriority: 3,
  }),
];
