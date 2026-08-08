/**
 * Loads `.env` at build time and bakes EXPO_PUBLIC_* values into the native
 * manifest (`extra.publicEnv`). Runtime code reads process.env first, then
 * falls back to Constants.expoConfig.extra.publicEnv — reliable for APK/EAS.
 */
// quiet: true — dotenv v17 tips include `{ ... }` on stdout and break `expo install --check --json`
require("dotenv").config({ quiet: true });

/** @returns {Record<string, string>} */
function buildPublicEnv() {
  const keys = [
    "EXPO_PUBLIC_APPS_SCRIPT_URL",
    "EXPO_PUBLIC_WHATSAPP_E164",
    "EXPO_PUBLIC_APP_WEB_URL",
    "EXPO_PUBLIC_LEGAL_TERMS_URL",
    "EXPO_PUBLIC_LEGAL_PRIVACY_URL",
    "EXPO_PUBLIC_HUBBLE_CLIENT_ID",
    "EXPO_PUBLIC_HUBBLE_APP_SECRET",
    "EXPO_PUBLIC_HUBBLE_ENV",
    "EXPO_PUBLIC_HUBBLE_ANALYTICS_LOG",
    "EXPO_PUBLIC_HUBBLE_DEMO_BRAND_IDS",
    "EXPO_PUBLIC_HUBBLE_USER_JWT",
    "EXPO_PUBLIC_VENDOR_CATALOG_SOURCE",
    "EXPO_PUBLIC_SHOP_CATALOG_SOURCE",
    "EXPO_PUBLIC_SHOP_SHEET_ID",
    "EXPO_PUBLIC_SHOP_PRODUCTS_GID",
    "EXPO_PUBLIC_SHOP_SHEET_PUBLISH_ID",
    "EXPO_PUBLIC_RAZORPAY_KEY_ID",
    "EXPO_PUBLIC_CUELINKS_API_TOKEN",
    "EXPO_PUBLIC_CUELINKS_PUBLISHER_ID",
    "EXPO_PUBLIC_CUELINKS_CHANNEL_ID",
    "EXPO_PUBLIC_CMS_API_URL",
  ];

  /** @type {Record<string, string>} */
  const env = {};
  for (const key of keys) {
    const fromProcess = process.env[key];
    if (fromProcess != null && fromProcess !== "") {
      env[key] = fromProcess;
    }
  }
  return env;
}

/** @param {{ config: import('expo/config').ExpoConfig }} ctx */
module.exports = ({ config }) => {
  const publicEnv = buildPublicEnv();
  return {
    ...config,
    extra: {
      ...config.extra,
      publicEnv,
    },
  };
};
