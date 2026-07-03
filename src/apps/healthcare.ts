import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const HEALTHCARE_APPS: ShopApp[] = [
  createApp({
    id: "app-practo",
    name: "Practo",
    appCategoryId: "healthcare",
    shopCategoryId: "beauty",
    description:
      "Book doctor appointments, consult online, order medicines, and access health records.",
    features: ["Doctor booking", "Online consult", "Health records", "Medicine delivery"],
    websiteUrl: "https://www.practo.com/",
    rating: 4.3,
    reviewCount: 720000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-apollo247",
    name: "Apollo 24/7",
    appCategoryId: "healthcare",
    shopCategoryId: "beauty",
    description:
      "Complete healthcare app for doctor consults, diagnostics, pharmacy, and health checkups.",
    features: ["Doctor consult", "Lab tests", "Pharmacy", "Health checkups"],
    websiteUrl: "https://www.apollo247.com/",
    rating: 4.2,
    reviewCount: 480000,
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-tata-1mg",
    name: "Tata 1mg",
    appCategoryId: "healthcare",
    shopCategoryId: "beauty",
    description:
      "Order medicines, book lab tests, and consult doctors with trusted healthcare services.",
    features: ["Medicine delivery", "Lab tests", "Doctor consult", "Health articles"],
    websiteUrl: "https://www.1mg.com/",
    rating: 4.4,
    reviewCount: 890000,
    sortPriority: 3,
  }),
];
