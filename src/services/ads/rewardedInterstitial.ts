import { ADMOB_REWARDED_INTERSTITIAL_UNIT_ID } from "@/constants/admob";
import { useAdRewardsStore } from "@/store/adRewardsStore";

export type ShowRewardedAdResult =
  | { ok: true; amount: number; remainingToday: number }
  | {
      ok: false;
      reason:
        | "unsupported"
        | "daily_cap"
        | "not_loaded"
        | "dismissed"
        | "error";
      message?: string;
    };

export function getRewardedInterstitialUnitId(): string {
  return ADMOB_REWARDED_INTERSTITIAL_UNIT_ID;
}

export function canWatchRewardedAdToday(): boolean {
  return useAdRewardsStore.getState().remainingAdWatchesToday() > 0;
}

/** Web / unsupported platforms. */
export async function showRewardedInterstitialForCredits(): Promise<ShowRewardedAdResult> {
  return {
    ok: false,
    reason: "unsupported",
    message: "Ads are available in the iOS and Android apps.",
  };
}

export async function preloadRewardedInterstitial(): Promise<void> {
  return;
}
