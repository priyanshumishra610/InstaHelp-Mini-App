/**
 * Google AdMob IDs for InstaHelp.
 * App: InstaHelp · ca-app-pub-6513857875305294~9603037789
 * Unit: Rewarded_Interstitial_Main · ca-app-pub-6513857875305294/3417961240
 *
 * Production unit IDs must only be used in release builds. __DEV__ uses Google test IDs
 * so the AdMob account is not flagged for invalid traffic.
 */

/** AdMob application ID (Android & iOS share this app in AdMob). */
export const ADMOB_APP_ID = "ca-app-pub-6513857875305294~9603037789";

/** Production rewarded interstitial ad unit. */
export const ADMOB_REWARDED_INTERSTITIAL_UNIT_ID =
  "ca-app-pub-6513857875305294/3417961240";

/** Credits granted after a completed rewarded interstitial (EARNED_REWARD only). */
export const REWARDED_AD_CREDIT_REWARD = 15;

/** Max successful ad-watch credit claims per local calendar day. */
export const REWARDED_AD_DAILY_MAX = 5;

export const REWARDED_AD_DAILY_MAX_CREDITS =
  REWARDED_AD_CREDIT_REWARD * REWARDED_AD_DAILY_MAX;
