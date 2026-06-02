import { Platform } from "react-native";

type TruecallerUnavailable = {
  kind: "unavailable";
  reason: string;
};

type TruecallerFailure = {
  kind: "failure";
  errorCode: string;
  message: string;
};

/** PKCE verifier + OAuth code delivered after the SDK consent succeeds. Must be handled only on the JS side token exchange / backend. */
type TruecallerSuccess = {
  kind: "success";
  authorizationCode: string;
  codeVerifier: string;
  state: string;
};

export type TruecallerAuthorizeResult =
  | TruecallerSuccess
  | TruecallerUnavailable
  | TruecallerFailure;

declare class InstahelpTruecallerAuthorizationError extends Error {
  code?: string;
}

type NativeModuleShape = {
  authorize: () => Promise<TruecallerAuthorizeResult>;
};

function resolveNative(): NativeModuleShape | null {
  if (Platform.OS !== "android") {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require("expo-modules-core") as typeof import("expo-modules-core");
    return requireNativeModule<NativeModuleShape>("InstahelpTruecaller");
  } catch {
    return null;
  }
}

const nativeAuth = resolveNative();

/**
 * Opens the native Truecaller OAuth consent (official SDK sheet). Uses InstaHelp’s hidden host activity internally.
 *
 * Always resolve with a typed result tag (never throw for user cancellations / unsupported devices).
 */
export async function authorizeWithTruecaller(): Promise<TruecallerAuthorizeResult> {
  if (!nativeAuth) {
    return { kind: "unavailable", reason: "not_android" };
  }
  try {
    return await nativeAuth.authorize();
  } catch (e) {
    const err = e as InstahelpTruecallerAuthorizationError;
    const code = typeof err.code === "string" ? err.code : "UNKNOWN";
    return {
      kind: "failure",
      errorCode: code,
      message: typeof err.message === "string" ? err.message : "Truecaller authorize failed",
    };
  }
}
