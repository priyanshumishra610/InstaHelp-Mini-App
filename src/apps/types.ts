import type { ShopApp } from "@/types/shopApp";

export type AppCategoryData = {
  id: ShopApp["appCategoryId"];
  label: string;
  apps: ShopApp[];
};
