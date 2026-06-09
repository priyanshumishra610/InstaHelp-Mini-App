import { FREE_SAVED_VENDOR_LIMIT } from "@/constants/exploreEntitlements";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
import { getExploreEntitlements } from "@/services/explore/exploreEntitlements";
import { useSavedVendorsStore } from "@/store/savedVendorsStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

export function useSaveVendor(vendorId: string) {
  const router = useRouter();
  const { subscription } = useExploreSubscription();
  const entitlements = getExploreEntitlements(subscription);
  const saved = useSavedVendorsStore((s) => s.vendorIds.includes(vendorId));
  const savedCount = useSavedVendorsStore((s) => s.vendorIds.length);
  const toggleSaved = useSavedVendorsStore((s) => s.toggleSaved);

  const promptUpgrade = useCallback(
    (feature: string) => {
      Alert.alert(
        "Upgrade to Pro",
        `${feature} is included with Explore Pro and Pro+.`,
        [
          { text: "Not now", style: "cancel" },
          {
            text: "View plans",
            onPress: () => router.push("/(tabs)/vendors/plans"),
          },
        ],
      );
    },
    [router],
  );

  const toggle = useCallback(() => {
    if (saved) {
      toggleSaved(vendorId);
      void Haptics.selectionAsync().catch(() => {});
      return { ok: true as const, saved: false };
    }

    if (
      entitlements.savedVendorLimit !== null &&
      savedCount >= entitlements.savedVendorLimit
    ) {
      promptUpgrade(
        `Saving more than ${FREE_SAVED_VENDOR_LIMIT} vendors`,
      );
      return { ok: false as const, reason: "limit" as const };
    }

    toggleSaved(vendorId);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
    return { ok: true as const, saved: true };
  }, [
    entitlements.savedVendorLimit,
    promptUpgrade,
    saved,
    savedCount,
    toggleSaved,
    vendorId,
  ]);

  return {
    saved,
    savedCount,
    entitlements,
    toggle,
    canSaveUnlimited: entitlements.savedVendorLimit === null,
  };
}
