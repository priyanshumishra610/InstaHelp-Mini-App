import { APP_LOGOS } from "@/apps/appLogos";
import type { ShopApp } from "@/types/shopApp";

type AppSeed = Omit<ShopApp, "logoUrl" | "bannerUrls">;

export function createApp(seed: AppSeed): ShopApp {
  const assets = APP_LOGOS[seed.id];
  const logoUrl = assets?.logoUrl ?? "";
  const bannerUrls = assets?.bannerUrls ?? (logoUrl ? [logoUrl] : []);

  return {
    ...seed,
    logoUrl,
    bannerUrls,
  };
}
