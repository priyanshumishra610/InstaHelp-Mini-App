import { isGoogleMobileAdsAvailable } from "@/services/ads/adsAvailability";

type MobileAdsModule = typeof import("react-native-google-mobile-ads");

let cachedModule: MobileAdsModule | null | undefined;

function loadAdsModule(): MobileAdsModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (!isGoogleMobileAdsAvailable()) {
    cachedModule = null;
    return null;
  }
  try {
    // Lazy require so Expo Go never evaluates the native TurboModule at import time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("react-native-google-mobile-ads") as MobileAdsModule;
    return cachedModule;
  } catch (error) {
    cachedModule = null;
    if (__DEV__) {
      console.warn("[AdMob] native module unavailable", error);
    }
    return null;
  }
}

let initPromise: Promise<void> | null = null;

export function isMobileAdsSupported(): boolean {
  return loadAdsModule() != null;
}

/**
 * Initializes the Google Mobile Ads SDK once at app launch.
 * No-ops in Expo Go and when the native module is missing.
 */
export function initializeMobileAds(): Promise<void> {
  const mod = loadAdsModule();
  if (!mod) return Promise.resolve();
  if (initPromise) return initPromise;

  const mobileAds = mod.default;
  const { MaxAdContentRating } = mod;

  initPromise = (async () => {
    try {
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : undefined,
      });
      await mobileAds().initialize();
    } catch (error) {
      if (__DEV__) {
        console.warn("[AdMob] initialize failed", error);
      }
    }
  })();

  return initPromise;
}
