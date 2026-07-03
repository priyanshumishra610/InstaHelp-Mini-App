import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const FOOD_APPS: ShopApp[] = [
  createApp({
    id: "app-swiggy",
    name: "Swiggy",
    appCategoryId: "food",
    shopCategoryId: "grocery",
    description:
      "Order food from your favourite restaurants with fast delivery and live order tracking.",
    features: ["Restaurant delivery", "Swiggy One", "Instamart groceries", "Live tracking"],
    websiteUrl: "https://www.swiggy.com/",
    rating: 4.4,
    reviewCount: 3200000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-zomato",
    name: "Zomato",
    appCategoryId: "food",
    shopCategoryId: "grocery",
    description:
      "Discover restaurants, order food online, and explore dining options near you.",
    features: ["Food delivery", "Restaurant reviews", "Dining out", "Zomato Gold"],
    websiteUrl: "https://www.zomato.com/india",
    rating: 4.3,
    reviewCount: 2900000,
    badge: "Trending",
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-eatsure",
    name: "EatSure",
    appCategoryId: "food",
    shopCategoryId: "grocery",
    description:
      "Hygienic, affordable meals delivered from trusted kitchens with quality assurance.",
    features: ["Hygienic kitchens", "Affordable meals", "Quality checks", "Fast delivery"],
    websiteUrl: "https://eatsure.in/",
    rating: 4.1,
    reviewCount: 120000,
    isNew: true,
    sortPriority: 3,
  }),
];
