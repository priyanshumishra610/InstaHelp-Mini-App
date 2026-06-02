"use strict";

const {
  AndroidConfig,
  createRunOncePlugin,
  withAndroidManifest,
} = require("@expo/config-plugins");

const PLUGIN_NAME = "with-instahelp-truecaller-android";

/**
 * Primary source: Expo `extra.truecallerAndroidClientId` merged in `app.config.js`.
 * @param {import("expo/config").ExpoConfig} config
 */
function resolveTruecallerClientId(config) {
  const fromDedicated = config.extra?.truecallerAndroidClientId;
  if (typeof fromDedicated === "string" && fromDedicated.trim()) {
    return fromDedicated.trim();
  }
  const fromPublicEnv = config.extra?.publicEnv?.EXPO_PUBLIC_TRUECALLER_CLIENT_ID;
  if (typeof fromPublicEnv === "string" && fromPublicEnv.trim()) {
    return fromPublicEnv.trim();
  }
  return "";
}

/**
 * Android 11+ package visibility — required so we can reliably detect/link out to Truecaller.
 */
function ensureTruecallerQueries(manifestXml) {
  const root = manifestXml.manifest;
  root.queries = root.queries ?? [];

  const hasTruecallerPackage = root.queries.some((segment) =>
    segment.package?.some((pkg) => pkg.$["android:name"] === "com.truecaller"),
  );

  if (!hasTruecallerPackage) {
    root.queries.push({
      package: [{ $: { "android:name": "com.truecaller" } }],
    });
  }
}

/**
 * Matches Truecaller’s Expo / React Native guidance (`singleTask`) for OAuth returns.
 */
function ensureMainActivityLaunchMode(manifestXml) {
  const mainActivity = AndroidConfig.Manifest.getMainActivity(manifestXml);
  if (!mainActivity?.$) {
    return;
  }
  if (!mainActivity.$["android:launchMode"]) {
    mainActivity.$["android:launchMode"] = "singleTask";
  }
}

function withTruecallerAndroidInternal(config) {
  return withAndroidManifest(config, (mod) => {
    const androidManifest = mod.modResults;
    const clientId = resolveTruecallerClientId(mod);

    if (clientId) {
      const mainApplication =
        AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        "com.truecaller.android.sdk.ClientId",
        clientId,
        "value",
      );
    }

    ensureTruecallerQueries(androidManifest);
    ensureMainActivityLaunchMode(androidManifest);

    return mod;
  });
}

module.exports = createRunOncePlugin(withTruecallerAndroidInternal, PLUGIN_NAME);
