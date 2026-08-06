import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

/**
 * Google Mobile Ads is not linked in Expo Go. Only use it when the native
 * TurboModule is actually registered in this binary.
 */
export function isGoogleMobileAdsAvailable(): boolean {
  try {
    if (Constants.appOwnership === "expo") return false;
    if (Constants.executionEnvironment === "storeClient") return false;
    // Definitive check — Expo Go never ships this module.
    if (!NativeModules.RNGoogleMobileAdsModule) return false;
    return Platform.OS === "ios" || Platform.OS === "android";
  } catch {
    return false;
  }
}
