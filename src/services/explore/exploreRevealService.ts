import {
  apiGetExploreSubscription,
  apiRecordExploreReveal,
} from "@/api/appsScriptClient";
import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import { useExploreSubscriptionStore } from "@/store/exploreSubscriptionStore";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import type { ExploreSubscription } from "@/types/exploreSubscription";
import { useCallback } from "react";

export type ExploreRevealAttemptResult =
  | { ok: true; alreadyUnlocked?: boolean; usedCredits?: boolean }
  | { ok: false; reason: "insufficient_credits" | "weekly_limit" | "network" };

function unlockVendorLocally(vendorId: string) {
  useVendorLeadStore.setState((s) => {
    if (s.unlockedVendorIds.includes(vendorId)) return s;
    return { unlockedVendorIds: [...s.unlockedVendorIds, vendorId] };
  });
}

export async function fetchExploreSubscription(
  phone: string,
): Promise<ExploreSubscription | null> {
  const res = await apiGetExploreSubscription(phone);
  if (!res.ok) return null;
  useExploreSubscriptionStore.getState().setSubscription(res.data);
  useExploreSubscriptionStore.getState().setLastFetchedPhone(phone);
  return res.data;
}

export function useRefreshExploreSubscription() {
  const setSubscription = useExploreSubscriptionStore((s) => s.setSubscription);
  const setLoading = useExploreSubscriptionStore((s) => s.setLoading);
  const setLastFetchedPhone = useExploreSubscriptionStore(
    (s) => s.setLastFetchedPhone,
  );

  return useCallback(async (phone: string | null) => {
    if (!phone) {
      setSubscription(null);
      setLastFetchedPhone(null);
      return null;
    }
    setLoading(true);
    try {
      return await fetchExploreSubscription(phone);
    } finally {
      setLoading(false);
    }
  }, [setLastFetchedPhone, setLoading, setSubscription]);
}

export async function tryExploreReveal(
  phone: string | null,
  vendorId: string,
): Promise<ExploreRevealAttemptResult> {
  const leadStore = useVendorLeadStore.getState();

  if (leadStore.isVendorUnlocked(vendorId)) {
    return { ok: true, alreadyUnlocked: true };
  }

  if (phone) {
    const revealRes = await apiRecordExploreReveal(phone, vendorId);
    if (!revealRes.ok) {
      return { ok: false, reason: "network" };
    }

    useExploreSubscriptionStore.getState().setSubscription(revealRes.data.subscription);

    if (!revealRes.data.ok) {
      if (revealRes.data.reason === "weekly_limit") {
        return { ok: false, reason: "weekly_limit" };
      }
      return { ok: false, reason: "network" };
    }

    if (!revealRes.data.usedCredits) {
      unlockVendorLocally(vendorId);
      return { ok: true, usedCredits: false };
    }
  }

  const creditRes = leadStore.tryRevealVendor(vendorId);
  if (!creditRes.ok) {
    if (phone) {
      await fetchExploreSubscription(phone).catch(() => null);
    }
    return { ok: false, reason: "insufficient_credits" };
  }

  return { ok: true, usedCredits: true, alreadyUnlocked: creditRes.alreadyUnlocked };
}

export function exploreRevealCostLabel(sub: ExploreSubscription | null): string {
  if (sub?.status === "active" && sub.unlimitedReveals) {
    return "Unlimited plan";
  }
  if (sub?.status === "active" && sub.plan === "pro") {
    const left = sub.revealsRemaining ?? 0;
    return `${left} reveals left this week`;
  }
  return `${VENDOR_REVEAL_CREDIT_COST} credits`;
}
