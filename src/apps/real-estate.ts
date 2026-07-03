import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const REAL_ESTATE_APPS: ShopApp[] = [
  createApp({
    id: "app-housing",
    name: "Housing",
    appCategoryId: "real-estate",
    shopCategoryId: "home-kitchen",
    description:
      "Search and explore properties for rent and sale with verified listings and photos.",
    features: ["Verified listings", "Property photos", "Rent & buy", "Locality insights"],
    websiteUrl: "https://housing.com/",
    rating: 4.2,
    reviewCount: 410000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 4,
  }),
  createApp({
    id: "app-99acres",
    name: "99acres",
    appCategoryId: "real-estate",
    shopCategoryId: "home-kitchen",
    description:
      "India's leading property portal to buy, sell, and rent residential and commercial spaces.",
    features: ["Buy & rent", "Commercial spaces", "Price trends", "Agent connect"],
    websiteUrl: "https://www.99acres.com/",
    rating: 4.1,
    reviewCount: 380000,
    sortPriority: 5,
  }),
  createApp({
    id: "app-magicbricks",
    name: "MagicBricks",
    appCategoryId: "real-estate",
    shopCategoryId: "home-kitchen",
    description:
      "Find your dream home with property listings, price estimates, and home loan tools.",
    features: ["Property search", "Home loans", "Price estimates", "Virtual tours"],
    websiteUrl: "https://www.magicbricks.com/",
    rating: 4.0,
    reviewCount: 350000,
    isNew: true,
    sortPriority: 6,
  }),
];
