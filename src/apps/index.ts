import type { AppCategoryData } from "@/apps/types";
import { BEAUTY_APPS } from "@/apps/beauty";
import { EDUCATION_APPS } from "@/apps/education";
import { ENTERTAINMENT_APPS } from "@/apps/entertainment";
import { FINANCE_APPS } from "@/apps/finance";
import { FOOD_APPS } from "@/apps/food";
import { GROCERY_APPS } from "@/apps/grocery";
import { HEALTHCARE_APPS } from "@/apps/healthcare";
import { LOGISTICS_APPS } from "@/apps/logistics";
import { REAL_ESTATE_APPS } from "@/apps/real-estate";
import { TRAVEL_APPS } from "@/apps/travel";
import type { ShopApp } from "@/types/shopApp";

export const APP_CATEGORIES: Record<string, AppCategoryData> = {
  travel: { id: "travel", label: "Travel", apps: TRAVEL_APPS },
  food: { id: "food", label: "Food Delivery", apps: FOOD_APPS },
  grocery: { id: "grocery", label: "Grocery", apps: GROCERY_APPS },
  finance: { id: "finance", label: "Finance", apps: FINANCE_APPS },
  education: { id: "education", label: "Education", apps: EDUCATION_APPS },
  entertainment: {
    id: "entertainment",
    label: "Entertainment",
    apps: ENTERTAINMENT_APPS,
  },
  healthcare: { id: "healthcare", label: "Healthcare", apps: HEALTHCARE_APPS },
  logistics: { id: "logistics", label: "Logistics", apps: LOGISTICS_APPS },
  "real-estate": {
    id: "real-estate",
    label: "Real Estate",
    apps: REAL_ESTATE_APPS,
  },
  beauty: { id: "beauty", label: "Beauty", apps: BEAUTY_APPS },
};

export const ALL_SHOP_APPS: ShopApp[] = Object.values(APP_CATEGORIES).flatMap(
  (cat) => cat.apps,
);

export function getShopAppById(id: string): ShopApp | undefined {
  return ALL_SHOP_APPS.find((app) => app.id === id);
}
