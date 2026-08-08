import { ADMOB_REWARDED_INTERSTITIAL_UNIT_ID } from "@/constants/admob";
import { isGoogleMobileAdsAvailable } from "@/services/ads/adsAvailability";
import { initializeMobileAds } from "@/services/ads/initializeMobileAds";
import { useAdRewardsStore } from "@/store/adRewardsStore";

type MobileAdsModule = typeof import("react-native-google-mobile-ads");
type RewardedInterstitialAd =
  import("react-native-google-mobile-ads").RewardedInterstitialAd;

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

const LOAD_TIMEOUT_MS = 20_000;
const FRIENDLY_UNAVAILABLE =
  "No ad available right now. Please try again in a moment.";

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
let ensurePromise: Promise<RewardedInterstitialAd | null> | null = null;
let showInFlight = false;

function createAd(mod: MobileAdsModule): RewardedInterstitialAd {
  return mod.RewardedInterstitialAd.createForAdRequest(
    getRewardedInterstitialUnitId(),
    {
      requestNonPersonalizedAdsOnly: false,
    },
  );
}

function isAdReady(ad: RewardedInterstitialAd | null): ad is RewardedInterstitialAd {
  return ad != null && ad.loaded === true;
}

function clearCachedAd(): void {
  cachedAd = null;
}

function loadAdInstance(
  mod: MobileAdsModule,
  ad: RewardedInterstitialAd,
): Promise<boolean> {
  if (ad.loaded) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      unsubLoaded();
      unsubError();
      resolve(ok);
    };

    const unsubLoaded = ad.addAdEventListener(
      mod.RewardedAdEventType.LOADED,
      () => finish(true),
    );
    const unsubError = ad.addAdEventListener(mod.AdEventType.ERROR, (error) => {
      if (__DEV__) {
        console.warn("[AdMob] rewarded interstitial load error", error);
      }
      finish(false);
    });

    const timeout = setTimeout(() => {
      if (__DEV__) {
        console.warn("[AdMob] rewarded interstitial load timed out");
      }
      finish(false);
    }, LOAD_TIMEOUT_MS);

    try {
      ad.load();
    } catch (error) {
      if (__DEV__) {
        console.warn("[AdMob] rewarded interstitial load threw", error);
      }
      finish(false);
    }
  });
}

async function loadFreshAd(
  mod: MobileAdsModule,
): Promise<RewardedInterstitialAd | null> {
  const ad = createAd(mod);
  cachedAd = ad;
  const loaded = await loadAdInstance(mod, ad);

  if (!loaded || !isAdReady(ad)) {
    cachedAd = null;
    return null;
  }

  return ad;
}

/**
 * Ensures a loaded ad is in cache. Creates/reloads as needed.
 * Never leaves a failed ad instance cached as "ready".
 * Concurrent callers share one in-flight load.
 */
function ensureLoadedAd(
  mod: MobileAdsModule,
): Promise<RewardedInterstitialAd | null> {
  if (isAdReady(cachedAd)) {
    return Promise.resolve(cachedAd);
  }

  if (ensurePromise) {
    return ensurePromise;
  }

  ensurePromise = loadFreshAd(mod).finally(() => {
    ensurePromise = null;
  });

  return ensurePromise;
}

const UNSUPPORTED: ShowRewardedAdResult = {
  ok: false,
  reason: "unsupported",
  message:
    "Ads need a development build. Expo Go does not include Google Mobile Ads.",
};

const NOT_LOADED: ShowRewardedAdResult = {
  ok: false,
  reason: "not_loaded",
  message: FRIENDLY_UNAVAILABLE,
};

export async function preloadRewardedInterstitial(): Promise<void> {
  const mod = loadAdsModule();
  if (!mod) return;
  if (!canWatchRewardedAdToday()) return;
  if (showInFlight) return;

  try {
    await initializeMobileAds();
    await ensureLoadedAd(mod);
  } catch (error) {
    clearCachedAd();
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

  if (showInFlight) {
    return NOT_LOADED;
  }

  try {
    await initializeMobileAds();
  } catch {
    return UNSUPPORTED;
  }

  const ad = await ensureLoadedAd(mod);
  if (!ad) {
    // Kick off a background preload for the next attempt.
    void preloadRewardedInterstitial();
    return NOT_LOADED;
  }

  // Final guard: never call native show() unless JS marks the ad loaded.
  if (!ad.loaded) {
    clearCachedAd();
    void preloadRewardedInterstitial();
    return NOT_LOADED;
  }

  showInFlight = true;

  return new Promise((resolve) => {
    let earned = false;
    let settled = false;
    let claimResult: ShowRewardedAdResult | null = null;

    const finish = (result: ShowRewardedAdResult) => {
      if (settled) return;
      settled = true;
      showInFlight = false;
      unsubEarned();
      unsubClosed();
      unsubError();
      clearCachedAd();
      void preloadRewardedInterstitial();
      resolve(result);
    };

    const unsubEarned = ad.addAdEventListener(
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

    const unsubClosed = ad.addAdEventListener(mod.AdEventType.CLOSED, () => {
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

    const unsubError = ad.addAdEventListener(mod.AdEventType.ERROR, () => {
      finish({
        ok: false,
        reason: "error",
        message: FRIENDLY_UNAVAILABLE,
      });
    });

    try {
      // Re-check right before show — load state can flip between await and now.
      if (!ad.loaded) {
        finish(NOT_LOADED);
        return;
      }
      void ad.show().catch(() => {
        finish({
          ok: false,
          reason: "error",
          message: FRIENDLY_UNAVAILABLE,
        });
      });
    } catch {
      finish({
        ok: false,
        reason: "error",
        message: FRIENDLY_UNAVAILABLE,
      });
    }
  });
}
