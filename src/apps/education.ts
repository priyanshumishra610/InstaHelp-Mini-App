import { createApp } from "@/apps/createApp";
import type { ShopApp } from "@/types/shopApp";

export const EDUCATION_APPS: ShopApp[] = [
  createApp({
    id: "app-unacademy",
    name: "Unacademy",
    appCategoryId: "education",
    shopCategoryId: "books",
    description:
      "India's largest learning platform with live classes, test series, and expert educators.",
    features: ["Live classes", "Test series", "Doubt solving", "Competitive exam prep"],
    websiteUrl: "https://unacademy.com/",
    rating: 4.3,
    reviewCount: 920000,
    badge: "Popular",
    isTrending: true,
    sortPriority: 1,
  }),
  createApp({
    id: "app-physicswallah",
    name: "PhysicsWallah",
    appCategoryId: "education",
    shopCategoryId: "books",
    description:
      "Affordable quality education for JEE, NEET, and board exams with top educators.",
    features: ["JEE & NEET prep", "Live lectures", "DPP sheets", "Affordable courses"],
    websiteUrl: "https://www.pw.live/",
    rating: 4.5,
    reviewCount: 1100000,
    badge: "Trending",
    isTrending: true,
    sortPriority: 2,
  }),
  createApp({
    id: "app-byjus",
    name: "Byju's",
    appCategoryId: "education",
    shopCategoryId: "books",
    description:
      "Personalised learning app with interactive video lessons for school and competitive exams.",
    features: ["Video lessons", "Personalised learning", "School curriculum", "Test prep"],
    websiteUrl: "https://byjus.com/",
    rating: 4.1,
    reviewCount: 850000,
    sortPriority: 3,
  }),
  createApp({
    id: "app-coursera",
    name: "Coursera",
    appCategoryId: "education",
    shopCategoryId: "office-supplies",
    description:
      "Learn job-relevant skills and earn certificates from top universities and companies.",
    features: ["University courses", "Certificates", "Specializations", "Career skills"],
    websiteUrl: "https://www.coursera.org/",
    rating: 4.6,
    reviewCount: 620000,
    isNew: true,
    sortPriority: 4,
  }),
];
