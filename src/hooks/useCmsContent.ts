import { useQuery } from "@tanstack/react-query";
import { fetchWeeklyOffers } from "@/services/content/homeContentService";
import { fetchCmsCategories } from "@/services/content/categoriesContentService";
import { fetchCmsShopContent } from "@/services/content/shopContentService";
import {
  fetchSplashConfig,
  fetchMobileAssets,
} from "@/services/content/mobileAssetsService";
import { CMS_IS_CONFIGURED } from "@/services/content/cmsClient";

const STALE_TIME = 5 * 60 * 1000;

export function useWeeklyOffers() {
  return useQuery({
    queryKey: ["cms", "weekly-offers"],
    queryFn: () => fetchWeeklyOffers(),
    staleTime: STALE_TIME,
    enabled: true,
    placeholderData: (prev) => prev,
  });
}

export function useCmsCategories() {
  return useQuery({
    queryKey: ["cms", "categories"],
    queryFn: () => fetchCmsCategories(),
    staleTime: STALE_TIME,
  });
}

export function useCmsShopContent() {
  return useQuery({
    queryKey: ["cms", "shop"],
    queryFn: () => fetchCmsShopContent(),
    staleTime: STALE_TIME,
  });
}

export function useSplashConfig() {
  return useQuery({
    queryKey: ["cms", "splash"],
    queryFn: () => fetchSplashConfig(),
    staleTime: STALE_TIME,
  });
}

export function useMobileAssets(type: string) {
  return useQuery({
    queryKey: ["cms", "mobile-assets", type],
    queryFn: () => fetchMobileAssets(type),
    staleTime: STALE_TIME,
    enabled: Boolean(type),
  });
}

export function useCmsStatus() {
  return { configured: CMS_IS_CONFIGURED };
}
