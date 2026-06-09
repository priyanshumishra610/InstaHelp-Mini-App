import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { getExploreEntitlements } from "@/services/explore/exploreEntitlements";
import { useExploreSubscriptionStore } from "@/store/exploreSubscriptionStore";
import { useEffect, useMemo } from "react";
import { useRefreshExploreSubscription } from "@/services/explore/exploreRevealService";

export function useExploreSubscription() {
  const phone = useAuthPhone();
  const subscription = useExploreSubscriptionStore((s) => s.subscription);
  const loading = useExploreSubscriptionStore((s) => s.loading);
  const lastFetchedPhone = useExploreSubscriptionStore((s) => s.lastFetchedPhone);
  const refresh = useRefreshExploreSubscription();

  const entitlements = useMemo(
    () => getExploreEntitlements(subscription),
    [subscription],
  );

  useEffect(() => {
    if (!phone) return;
    if (lastFetchedPhone === phone && subscription) return;
    void refresh(phone);
  }, [phone, lastFetchedPhone, subscription, refresh]);

  return {
    subscription,
    entitlements,
    loading,
    refresh: () => (phone ? refresh(phone) : Promise.resolve(null)),
    isProActive: entitlements.isPro,
    isProPlusActive: entitlements.isProPlus,
  };
}
