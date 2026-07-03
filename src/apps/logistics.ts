import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const LOGISTICS_APPS: ShopApp[] = [
  createApp({
    id: "app-delhivery",
    name: "Delhivery",
    appCategoryId: "logistics",
    shopCategoryId: "home-kitchen",
    description:
      "Track shipments, schedule pickups, and manage deliveries across India.",
    features: ["Shipment tracking", "Pickup scheduling", "Nationwide delivery", "Business shipping"],
    websiteUrl: "https://www.delhivery.com/",
    rating: 4.1,
    reviewCount: 340000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-porter",
    name: "Porter",
    appCategoryId: "logistics",
    shopCategoryId: "home-kitchen",
    description:
      "On-demand mini-truck and two-wheeler delivery for goods and house shifting.",
    features: ["Mini trucks", "Two-wheeler delivery", "House shifting", "On-demand booking"],
    websiteUrl: "https://porter.in/",
    rating: 4.3,
    reviewCount: 520000,
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-dtdc",
    name: "DTDC",
    appCategoryId: "logistics",
    shopCategoryId: "home-kitchen",
    description:
      "Courier and cargo services with real-time tracking and doorstep pickup across India.",
    features: ["Courier tracking", "Doorstep pickup", "Express delivery", "International shipping"],
    websiteUrl: "https://www.dtdc.in/",
    rating: 4.0,
    reviewCount: 280000,
    sortPriority: 3,
  }),
];
