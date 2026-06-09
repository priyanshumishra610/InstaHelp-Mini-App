import {
  FREE_SAVED_VENDOR_LIMIT,
  isEarlyAccessCategory,
  PRO_PLUS_MULTI_CITY_LIMIT,
} from "@/constants/exploreEntitlements";
import type { ExploreSubscription } from "@/types/exploreSubscription";

export type ExploreEntitlements = {
  plan: "free" | "pro" | "pro_plus";
  isActive: boolean;
  isPro: boolean;
  isProPlus: boolean;
  canUseVerifiedFilter: boolean;
  savedVendorLimit: number | null;
  canUseMultiCity: boolean;
  multiCityLimit: number;
  hasPlanReveals: boolean;
  canAccessEarlyCategories: boolean;
  whatsAppPriority: boolean;
  skipGamesGrind: boolean;
};

export function getExploreEntitlements(
  subscription: ExploreSubscription | null | undefined,
): ExploreEntitlements {
  const isActive = subscription?.status === "active";
  const plan =
    isActive && subscription?.plan === "pro_plus"
      ? "pro_plus"
      : isActive && subscription?.plan === "pro"
        ? "pro"
        : "free";

  const isPro = plan === "pro" || plan === "pro_plus";
  const isProPlus = plan === "pro_plus";

  return {
    plan,
    isActive: isActive ?? false,
    isPro,
    isProPlus,
    canUseVerifiedFilter: isPro,
    savedVendorLimit: isPro ? null : FREE_SAVED_VENDOR_LIMIT,
    canUseMultiCity: isProPlus,
    multiCityLimit: PRO_PLUS_MULTI_CITY_LIMIT,
    hasPlanReveals: isPro,
    canAccessEarlyCategories: isProPlus,
    whatsAppPriority: isProPlus,
    skipGamesGrind: isPro,
  };
}

export function canViewVendorCategory(
  category: string,
  entitlements: ExploreEntitlements,
): boolean {
  if (!isEarlyAccessCategory(category)) return true;
  return entitlements.canAccessEarlyCategories;
}

export function explorePlanDisplayName(
  entitlements: ExploreEntitlements,
): string | null {
  if (!entitlements.isActive) return null;
  if (entitlements.isProPlus) return "Pro+";
  if (entitlements.plan === "pro") return "Pro";
  return null;
}
