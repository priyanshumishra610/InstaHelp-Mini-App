import Constants from "expo-constants";

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxY3jUaZff3lpInIyOMxmy_vpRsueaghpf2ko8EQlrrVWERpG58pcFEQkDmLSxxxcq7/exec";

const DEFAULT_WHATSAPP_E164 = "917022702220";
const DEFAULT_APP_WEB_URL = "https://instahelp.in";

type PublicEnvMap = Record<string, string | undefined>;

function bakedPublicEnv(): PublicEnvMap {
  const extra = Constants.expoConfig?.extra as
    | { publicEnv?: PublicEnvMap }
    | undefined;
  return extra?.publicEnv ?? {};
}

/** Metro inlines EXPO_PUBLIC_* at bundle time; APK builds also read baked `extra.publicEnv`. */
export function getPublicEnv(key: string, fallback = ""): string {
  const fromProcess = process.env[key];
  if (fromProcess != null && fromProcess !== "") {
    return fromProcess;
  }
  const baked = bakedPublicEnv()[key];
  if (baked != null && baked !== "") {
    return baked;
  }
  return fallback;
}

export const APPS_SCRIPT_URL = getPublicEnv(
  "EXPO_PUBLIC_APPS_SCRIPT_URL",
  DEFAULT_APPS_SCRIPT_URL,
);

export const WHATSAPP_E164 = getPublicEnv(
  "EXPO_PUBLIC_WHATSAPP_E164",
  DEFAULT_WHATSAPP_E164,
);

export const APP_WEB_URL = getPublicEnv(
  "EXPO_PUBLIC_APP_WEB_URL",
  DEFAULT_APP_WEB_URL,
);

export const LEGAL_TERMS_URL = getPublicEnv(
  "EXPO_PUBLIC_LEGAL_TERMS_URL",
  `${APP_WEB_URL}/terms`,
);

export const LEGAL_PRIVACY_URL = getPublicEnv(
  "EXPO_PUBLIC_LEGAL_PRIVACY_URL",
  `${APP_WEB_URL}/privacy`,
);

export function appWebHostLabel(): string {
  try {
    return new URL(APP_WEB_URL).host.replace(/^www\./, "");
  } catch {
    return APP_WEB_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

export const FIREBASE_API_KEY = getPublicEnv("EXPO_PUBLIC_FIREBASE_API_KEY");
export const FIREBASE_PROJECT_ID = getPublicEnv(
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
);
export const FIREBASE_IS_CONFIGURED = Boolean(
  FIREBASE_API_KEY && FIREBASE_PROJECT_ID,
);

export type ShopCatalogSource = "bundled_csv" | "live";

/** Shop product catalog: live (default) | bundled_csv (offline fallback). */
export function getShopCatalogSource(): ShopCatalogSource {
  const explicit = getPublicEnv("EXPO_PUBLIC_SHOP_CATALOG_SOURCE");
  if (explicit === "bundled_csv") return "bundled_csv";
  // Accept legacy alias used in older env files.
  if (explicit === "google_sheet" || explicit === "live" || !explicit) {
    return "live";
  }
  return "live";
}

export const SHOP_SHEET_ID = getPublicEnv(
  "EXPO_PUBLIC_SHOP_SHEET_ID",
  "1XfPC6fcV_Ct97vDwaRJDVbZ2hJNQRvj2FWj0nddqwR4",
);

export const SHOP_PRODUCTS_GID = getPublicEnv(
  "EXPO_PUBLIC_SHOP_PRODUCTS_GID",
  "0",
);

/** Optional published CSV id; leave empty to use the shared export URL. */
export const SHOP_SHEET_PUBLISH_ID = getPublicEnv(
  "EXPO_PUBLIC_SHOP_SHEET_PUBLISH_ID",
  "",
);

export type ExperienceCatalogSource = "bundled_json" | "google_sheet";

/** Experiences catalogs: live CSV (default) | bundled_json (offline fallback only). */
export function getExperienceCatalogSource(): ExperienceCatalogSource {
  const explicit = getPublicEnv("EXPO_PUBLIC_EXPERIENCE_CATALOG_SOURCE");
  if (explicit === "bundled_json") return "bundled_json";
  return "google_sheet";
}

export const HOLIDAYS_SHEET_ID = getPublicEnv(
  "EXPO_PUBLIC_HOLIDAYS_SHEET_ID",
  "1R8pZjN6QTOgalKDdeGRUBKl1mPG_jWewC1OuYR1mb7Q",
);
export const HOLIDAYS_GID = getPublicEnv("EXPO_PUBLIC_HOLIDAYS_GID", "0");

export const RESORTS_SHEET_ID = getPublicEnv(
  "EXPO_PUBLIC_RESORTS_SHEET_ID",
  "1vz6jayRkSgbThzDWBclrKMRBXjHvwW4qeq7Cic7VULE",
);
export const RESORTS_GID = getPublicEnv(
  "EXPO_PUBLIC_RESORTS_GID",
  "531031007",
);

export const COUNTRIES_SHEET_ID = getPublicEnv(
  "EXPO_PUBLIC_COUNTRIES_SHEET_ID",
  "1n-Ryo5nYJbWbQzV3fn0lbOpE6uDSM0ia5MjsNsvP-xE",
);
export const COUNTRIES_GID = getPublicEnv(
  "EXPO_PUBLIC_COUNTRIES_GID",
  "1349863230",
);

/** Razorpay Key ID (public) — secret stays in Apps Script Script properties */
export const RAZORPAY_KEY_ID = getPublicEnv("EXPO_PUBLIC_RAZORPAY_KEY_ID");
export const RAZORPAY_IS_CONFIGURED = Boolean(RAZORPAY_KEY_ID);

/** Cuelinks — channel/publisher id from shop script (`var cId = '284356'`) */
export const CUELINKS_API_TOKEN = getPublicEnv("EXPO_PUBLIC_CUELINKS_API_TOKEN");
export const CUELINKS_PUBLISHER_ID = getPublicEnv(
  "EXPO_PUBLIC_CUELINKS_PUBLISHER_ID",
  "284356",
);
/** Same as web `cId` — used in linksredirect.com affiliate wrapping */
export const CUELINKS_CHANNEL_ID = getPublicEnv(
  "EXPO_PUBLIC_CUELINKS_CHANNEL_ID",
  CUELINKS_PUBLISHER_ID || "284356",
);
export const CUELINKS_IS_CONFIGURED = Boolean(CUELINKS_API_TOKEN);
export const CUELINKS_TRACKING_READY = Boolean(CUELINKS_CHANNEL_ID);

/** InstaHelp CMS content API — dynamic banners, categories, deals, mobile assets */
export const CMS_API_URL = getPublicEnv("EXPO_PUBLIC_CMS_API_URL");
export const CMS_IS_CONFIGURED = Boolean(CMS_API_URL);
