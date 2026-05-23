/**
 * Loads `.env` at build time and bakes EXPO_PUBLIC_* values into the native
 * manifest (`extra.publicEnv`). Runtime code reads process.env first, then
 * falls back to Constants.expoConfig.extra.publicEnv — reliable for APK/EAS.
 *
 * If `google-services.json` exists at the repo root (gitignored), Expo copies
 * it into the Android project and fills missing Firebase env keys for JS SDK.
 */
// quiet: true — dotenv v17 tips include `{ ... }` on stdout and break `expo install --check --json`
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = __dirname;

/** Extract EXPO_PUBLIC_FIREBASE_* from root `google-services.json` when .env omitted. */
function loadFirebaseDefaultsFromGoogleServices() {
  const filePath = path.join(PROJECT_ROOT, "google-services.json");
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const pi = parsed.project_info;
    const client = Array.isArray(parsed.client) ? parsed.client[0] : null;
    const apiKey =
      client?.api_key?.[0]?.current_key ?? parsed.client?.api_key?.[0]?.current_key;
    const appId = client?.client_info?.mobilesdk_app_id;
    if (!pi?.project_id || !apiKey || !appId) {
      return {};
    }
    const projectId = pi.project_id;
    return {
      EXPO_PUBLIC_FIREBASE_API_KEY: apiKey,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: `${projectId}.firebaseapp.com`,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: projectId,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: pi.storage_bucket ?? `${projectId}.appspot.com`,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: String(pi.project_number ?? ""),
      EXPO_PUBLIC_FIREBASE_APP_ID: appId,
    };
  } catch {
    return {};
  }
}

const firebaseDefaults = loadFirebaseDefaultsFromGoogleServices();
const googleServicesPath = path.join(PROJECT_ROOT, "google-services.json");
const googleServicesConfigured = fs.existsSync(googleServicesPath);

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
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_APP_ID",
    "EXPO_PUBLIC_VENDOR_CATALOG_SOURCE",
  ];

  /** @type {Record<string, string>} */
  const env = {};
  for (const key of keys) {
    const fromProcess = process.env[key];
    if (fromProcess != null && fromProcess !== "") {
      env[key] = fromProcess;
      continue;
    }
    if (firebaseDefaults[key]) {
      env[key] = firebaseDefaults[key];
    }
  }
  return env;
}

/** @param {{ config: import('expo/config').ExpoConfig }} ctx */
module.exports = ({ config }) => {
  const patchedAndroid = googleServicesConfigured
    ? {
        ...config.android,
        googleServicesFile: "./google-services.json",
      }
    : config.android;

  return {
    ...config,
    android: patchedAndroid,
    extra: {
      ...config.extra,
      publicEnv: buildPublicEnv(),
    },
  };
};
