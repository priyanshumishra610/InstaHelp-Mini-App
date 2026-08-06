import type { Booking } from "@/types/booking";
import type {
  ExploreOrderResult,
  ExploreRevealResult,
  ExploreSubscription,
} from "@/types/exploreSubscription";
import type { UserProfile } from "@/types/user";

import { APPS_SCRIPT_URL } from "./env";

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function postJson<T>(body: Record<string, unknown>): Promise<ApiEnvelope<T>> {
  if (!APPS_SCRIPT_URL) {
    return { ok: false, error: "Missing EXPO_PUBLIC_APPS_SCRIPT_URL" };
  }
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const rawText = await res.text();
    let json: ApiEnvelope<T> | null = null;
    try {
      json = JSON.parse(rawText) as ApiEnvelope<T>;
    } catch {
      if (rawText.includes("Page not found") || rawText.startsWith("<!DOCTYPE")) {
        return {
          ok: false,
          error:
            "Apps Script web app URL is invalid or not deployed. Update EXPO_PUBLIC_APPS_SCRIPT_URL in .env.",
        };
      }
      return { ok: false, error: "Unexpected response from Apps Script (not JSON)." };
    }
    if (!res.ok) {
      return {
        ok: false,
        error: typeof json === "object" && json && "error" in json
          ? String((json as { error?: unknown }).error)
          : `Request failed (${res.status})`,
      };
    }
    if (json && typeof json === "object" && "ok" in json) {
      return json as ApiEnvelope<T>;
    }
    return { ok: false, error: "Unexpected response shape" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export type CreateBookingPayload = {
  phone: string;
  serviceId: string;
  serviceLabel: string;
  description: string;
  preferredTime: string;
  notes?: string;
  imageBase64?: string | null;
  name?: string;
  email?: string;
  address?: string;
  source?: string;
  paidStatus?: string;
  consent?: boolean;
};

export async function apiCreateBooking(payload: CreateBookingPayload) {
  return postJson<Booking>({ action: "createBooking", ...payload });
}

export async function apiGetBookings(phone: string) {
  return postJson<Booking[]>({ action: "getBookings", phone });
}

export async function apiGetUserProfile(phone: string) {
  return postJson<UserProfile>({ action: "getUserProfile", phone });
}

/** Upsert phone row in the backend (sign-in / registration). */
export async function apiRegisterPhone(phone: string) {
  return postJson<UserProfile>({ action: "register", phone });
}

export type UpdateProfilePayload = Pick<UserProfile, "name" | "addresses" | "favorites"> & {
  phone: string;
  age?: number | null;
  gender?: UserProfile["gender"];
  city?: string | null;
  email?: string | null;
  birthday?: string | null;
  anniversary?: string | null;
};

export async function apiUpdateProfile(payload: UpdateProfilePayload) {
  return postJson<UserProfile>({ action: "updateProfile", ...payload });
}

export type VendorRegistrationPayload = {
  phone: string;
  name?: string;
  email: string;
  businessName: string;
  businessType: string;
  city: string;
  expectations: string[];
};

export type VendorRegistrationResult = {
  id: string;
  status: string;
};

export async function apiRegisterVendor(payload: VendorRegistrationPayload) {
  return postJson<VendorRegistrationResult>({ action: "registerVendor", ...payload });
}

export async function apiCreateExploreOrder(phone: string, planId: string) {
  return postJson<ExploreOrderResult>({
    action: "createExploreOrder",
    phone,
    planId,
  });
}

export async function apiVerifyExplorePayment(payload: {
  phone: string;
  planId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return postJson<ExploreSubscription>({
    action: "verifyExplorePayment",
    ...payload,
  });
}

export async function apiGetExploreSubscription(phone: string) {
  return postJson<ExploreSubscription>({
    action: "getExploreSubscription",
    phone,
  });
}

export async function apiRecordExploreReveal(phone: string, vendorId: string) {
  return postJson<ExploreRevealResult>({
    action: "recordExploreReveal",
    phone,
    vendorId,
  });
}

/** Short-lived RS256 JWT for Hubble SDK SSO (see scripts/code.gs → getHubbleToken). */
export async function apiGetHubbleToken(payload: {
  phone: string;
  name?: string;
  email?: string;
}) {
  return postJson<{ token: string }>({ action: "getHubbleToken", ...payload });
}
