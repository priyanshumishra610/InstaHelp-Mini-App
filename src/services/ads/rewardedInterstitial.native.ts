import { ADMOB_REWARDED_INTERSTITIAL_UNIT_ID } from "@/constants/admob";
import { isGoogleMobileAdsAvailable } from "@/services/ads/adsAvailability";
import { initializeMobileAds } from "@/services/ads/initializeMobileAds";
import { useAdRewardsStore } from "@/store/adRewardsStore";

type MobileAdsModule = typeof import("react-native-google-mobile-ads");
type RewardedInterstitialAd = import("react-native-google-mobile-ads").RewardedInterstitialAd;

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

let cachedModule: MobileAdsModule | null | undefined;

function loadAdsModule(): MobileAdsModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (!isGoogleMobileAdsAvailable()) {
    cachedModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("react-native-google-mobile-ads") as MobileAdsModule;
    return cachedModule;
  } catch (error) {
    cachedModule = null;
    if (__DEV__) {
      console.warn("[AdMob] rewarded module unavailable", error);
    }
    return null;
  }
}

export function getRewardedInterstitialUnitId(): string {
  const mod = loadAdsModule();
  if (!mod || __DEV__) {
    return mod?.TestIds.REWARDED_INTERSTITIAL ?? ADMOB_REWARDED_INTERSTITIAL_UNIT_ID;
  }
  return ADMOB_REWARDED_INTERSTITIAL_UNIT_ID;
}

export function canWatchRewardedAdToday(): boolean {
  return useAdRewardsStore.getState().remainingAdWatchesToday() > 0;
}

let cachedAd: RewardedInterstitialAd | null = null;
let loadingPromise: Promise<boolean> | null = null;

function createAd(mod: MobileAdsModule): RewardedInterstitialAd {
  return mod.RewardedInterstitialAd.createForAdRequest(
    getRewardedInterstitialUnitId(),
    {
      requestNonPersonalizedAdsOnly: false,
    },
  );
}

function loadAdInstance(
  mod: MobileAdsModule,
  ad: RewardedInterstitialAd,
): Promise<boolean> {
  return new Promise((resolve) => {
    const unsubLoaded = ad.addAdEventListener(
      mod.RewardedAdEventType.LOADED,
      () => {
        cleanup();
        resolve(true);
      },
    );
    const unsubError = ad.addAdEventListener(mod.AdEventType.ERROR, (error) => {
      cleanup();
      if (__DEV__) {
        console.warn("[AdMob] rewarded interstitial load error", error);
      }
      resolve(false);
    });

    function cleanup() {
      unsubLoaded();
      unsubError();
    }

    ad.load();
  });
}

const UNSUPPORTED: ShowRewardedAdResult = {
  ok: false,
  reason: "unsupported",
  message:
    "Ads need a development build. Expo Go does not include Google Mobile Ads.",
};

export async function preloadRewardedInterstitial(): Promise<void> {
  const mod = loadAdsModule();
  if (!mod) return;
  if (!canWatchRewardedAdToday()) return;
  try {
    await initializeMobileAds();
    if (loadingPromise) {
      await loadingPromise;
      return;
    }
    const ad = createAd(mod);
    cachedAd = ad;
    loadingPromise = loadAdInstance(mod, ad).finally(() => {
      loadingPromise = null;
    });
    await loadingPromise;
  } catch (error) {
    cachedAd = null;
    loadingPromise = null;
    if (__DEV__) {
      console.warn("[AdMob] preload skipped", error);
    }
  }
}

/**
 * Shows a rewarded interstitial. Credits are granted only on EARNED_REWARD
 * (AdMob policy: never reward for incomplete views).
 */
export async function showRewardedInterstitialForCredits(): Promise<ShowRewardedAdResult> {
  const mod = loadAdsModule();
  if (!mod) return UNSUPPORTED;

  if (!canWatchRewardedAdToday()) {
    return {
      ok: false,
      reason: "daily_cap",
      message: "Daily ad reward limit reached. Come back tomorrow.",
    };
  }

  try {
    await initializeMobileAds();
  } catch {
    return UNSUPPORTED;
  }

  let ad = cachedAd;
  if (!ad) {
    ad = createAd(mod);
    cachedAd = ad;
    const loaded = await loadAdInstance(mod, ad);
    if (!loaded) {
      cachedAd = null;
      return {
        ok: false,
        reason: "not_loaded",
        message: "No ad available right now. Try again in a moment.",
      };
    }
  } else if (loadingPromise) {
    const loaded = await loadingPromise;
    if (!loaded) {
      cachedAd = null;
      return {
        ok: false,
        reason: "not_loaded",
        message: "No ad available right now. Try again in a moment.",
      };
    }
  }

  return new Promise((resolve) => {
    let earned = false;
    let settled = false;
    let claimResult: ShowRewardedAdResult | null = null;

    const finish = (result: ShowRewardedAdResult) => {
      if (settled) return;
      settled = true;
      unsubEarned();
      unsubClosed();
      unsubError();
      cachedAd = null;
      void preloadRewardedInterstitial();
      resolve(result);
    };

    const unsubEarned = ad!.addAdEventListener(
      mod.RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
        const claim = useAdRewardsStore.getState().tryClaimAdWatchReward();
        if (claim.ok) {
          claimResult = {
            ok: true,
            amount: claim.amount,
            remainingToday: claim.remainingToday,
          };
        } else {
          claimResult = {
            ok: false,
            reason: "daily_cap",
            message: "Daily ad reward limit reached. Come back tomorrow.",
          };
        }
      },
    );

    const unsubClosed = ad!.addAdEventListener(mod.AdEventType.CLOSED, () => {
      setTimeout(() => {
        if (settled) return;
        if (earned && claimResult) {
          finish(claimResult);
          return;
        }
        finish({
          ok: false,
          reason: "dismissed",
          message: "Watch the full ad to earn credits.",
        });
      }, 200);
    });

    const unsubError = ad!.addAdEventListener(mod.AdEventType.ERROR, (error) => {
      finish({
        ok: false,
        reason: "error",
        message: error?.message ?? "Ad failed to show.",
      });
    });

    try {
      ad!.show();
    } catch (error) {
      finish({
        ok: false,
        reason: "error",
        message:
          error instanceof Error ? error.message : "Ad failed to show.",
      });
    }
  });
}
