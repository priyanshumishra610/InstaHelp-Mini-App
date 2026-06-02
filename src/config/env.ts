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
