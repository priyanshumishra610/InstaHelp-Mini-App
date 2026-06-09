import { apiGetHubbleToken } from "@/api/appsScriptClient";
import { APPS_SCRIPT_URL, getPublicEnv } from "@/config/env";

const DEV_OVERRIDE_JWT = getPublicEnv("EXPO_PUBLIC_HUBBLE_USER_JWT");

/** Reject tokens with less than this many seconds before `exp`. */
const JWT_EXPIRY_BUFFER_SEC = 15;

export type FetchHubbleTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

function looksLikeJwt(value: string): boolean {
  return value.split(".").length === 3;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded =
      typeof atob === "function"
        ? atob(padded)
        : typeof globalThis.Buffer !== "undefined"
          ? globalThis.Buffer.from(padded, "base64").toString("utf8")
          : null;
    if (!decoded) return null;
    const parsed: unknown = JSON.parse(decoded);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function isJwtUsable(token: string): boolean {
  if (!looksLikeJwt(token)) return false;
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp > nowSec + JWT_EXPIRY_BUFFER_SEC;
}

export type FetchHubbleTokenInput = {
  phone: string;
  name?: string | null;
  email?: string | null;
};

/**
 * Mint or fetch a short-lived Hubble JWT for the signed-in InstaHelp user.
 * Always prefers a fresh token from Apps Script; dev `.env` JWT is fallback only.
 */
export async function fetchHubbleSsoToken(
  input: FetchHubbleTokenInput,
): Promise<FetchHubbleTokenResult> {
  if (!APPS_SCRIPT_URL) {
    return {
      ok: false,
      error: "Set EXPO_PUBLIC_APPS_SCRIPT_URL in .env to your deployed Apps Script web app URL.",
    };
  }

  const res = await apiGetHubbleToken({
    phone: input.phone,
    name: input.name ?? undefined,
    email: input.email ?? undefined,
  });

  if (res.ok && res.data?.token) {
    const token = res.data.token.trim();
    if (isJwtUsable(token)) {
      return { ok: true, token };
    }
    return {
      ok: false,
      error:
        "Apps Script returned an expired JWT. Redeploy code.gs and check HUBBLE_JWT_PRIVATE_KEY.",
    };
  }

  const apiError =
    !res.ok && res.error
      ? res.error
      : "Apps Script did not return a token. Deploy the latest code.gs with getHubbleToken.";

  if (__DEV__ && DEV_OVERRIDE_JWT && isJwtUsable(DEV_OVERRIDE_JWT)) {
    return { ok: true, token: DEV_OVERRIDE_JWT };
  }

  if (__DEV__) {
    console.warn("[Hubble SSO]", apiError);
  }

  return { ok: false, error: apiError };
}
