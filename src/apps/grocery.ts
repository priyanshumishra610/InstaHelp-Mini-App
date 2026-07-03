import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const GROCERY_APPS: ShopApp[] = [
  createApp({
    id: "app-blinkit",
    name: "Blinkit",
    appCategoryId: "grocery",
    shopCategoryId: "grocery",
    description:
      "Get groceries, snacks, and daily essentials delivered in minutes to your doorstep.",
    features: ["10-min delivery", "Fresh produce", "Daily essentials", "Wide selection"],
    websiteUrl: "https://blinkit.com/",
    rating: 4.3,
    reviewCount: 1800000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-zepto",
    name: "Zepto",
    appCategoryId: "grocery",
    shopCategoryId: "grocery",
    description:
      "Quick commerce app delivering groceries and essentials in under 10 minutes.",
    features: ["10-min delivery", "No minimum order", "Fresh groceries", "Daily deals"],
    websiteUrl: "https://www.zeptonow.com/",
    rating: 4.2,
    reviewCount: 950000,
    badge: "Trending",
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-bigbasket",
    name: "BigBasket",
    appCategoryId: "grocery",
    shopCategoryId: "grocery",
    description:
      "India's largest online supermarket for fresh produce, staples, and household items.",
    features: ["Scheduled delivery", "Fresh produce", "BB Daily", "Wide catalogue"],
    websiteUrl: "https://www.bigbasket.com/",
    rating: 4.4,
    reviewCount: 1100000,
    sortPriority: 3,
  }),
];
