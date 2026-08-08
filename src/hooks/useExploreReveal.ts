import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
import { alertInsufficientCredits } from "@/services/ads/alertInsufficientCredits";
import {
  exploreRevealCostLabel,
  tryExploreReveal,
} from "@/services/explore/exploreRevealService";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

export function useExploreReveal() {
  const router = useRouter();
  const phone = useAuthPhone();
  const { subscription } = useExploreSubscription();

  const credits = useVendorLeadStore((s) => s.credits);
  const isVendorUnlocked = useVendorLeadStore((s) => s.isVendorUnlocked);

  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingReveals, setPendingReveals] = useState<Set<string>>(
    () => new Set(),
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const revealCostLabel = useMemo(
    () => exploreRevealCostLabel(subscription),
    [subscription],
  );

  const explorePlanLabel =
    subscription?.status === "active"
      ? subscription.plan === "pro_plus"
        ? "Pro+"
        : subscription.plan === "pro"
          ? `Pro · ${subscription.revealsRemaining ?? 0}/wk`
          : null
      : null;

  const isVendorUnlockedOrPending = useCallback(
    (vendorId: string) =>
      isVendorUnlocked(vendorId) || pendingReveals.has(vendorId),
    [isVendorUnlocked, pendingReveals],
  );

  const showToastMsg = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2700);
  }, []);

  const handleReveal = useCallback(
    async (vendorId: string) => {
      if (isVendorUnlocked(vendorId) || pendingReveals.has(vendorId)) return;

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPendingReveals((prev) => new Set(prev).add(vendorId));

      const res = await tryExploreReveal(phone, vendorId);

      setPendingReveals((prev) => {
        const next = new Set(prev);
        next.delete(vendorId);
        return next;
      });

      if (!res.ok) {
        if (res.reason === "weekly_limit") {
          Alert.alert(
            "Weekly limit reached",
            "Your Pro plan includes 10 reveals per week. Upgrade to Pro+ for unlimited reveals, or wait until Monday.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "View plans",
                onPress: () => router.push("/(tabs)/vendors/plans"),
              },
            ],
          );
          return;
        }
        alertInsufficientCredits({
          needCredits: VENDOR_REVEAL_CREDIT_COST,
          onOpenPlans: () => router.push("/(tabs)/vendors/plans"),
          onOpenCredits: () => setHistoryOpen(true),
        });
        return;
      }

      if (!res.alreadyUnlocked) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMsg(
          res.usedCredits
            ? "Unlocked! Call or WhatsApp from the profile."
            : "Unlocked with your Explore plan!",
        );
      }
    },
    [isVendorUnlocked, pendingReveals, phone, router, showToastMsg],
  );

  return {
    credits,
    isVendorUnlocked: isVendorUnlockedOrPending,
    toast,
    historyOpen,
    setHistoryOpen,
    revealCostLabel,
    explorePlanLabel,
    handleReveal,
  };
}

export type ExploreRevealState = ReturnType<typeof useExploreReveal>;
