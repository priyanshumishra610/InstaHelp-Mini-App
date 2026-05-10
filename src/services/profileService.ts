import {
  apiGetUserProfile,
  apiUpdateProfile,
} from "@/api/appsScriptClient";
import { APPS_SCRIPT_URL } from "@/api/env";
import { useAuthStore } from "@/store/authStore";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import type { UserProfile } from "@/types/user";

export async function refreshProfile(): Promise<UserProfile | null> {
  const phone = useAuthStore.getState().phone;
  if (!phone) return null;

  if (!APPS_SCRIPT_URL) {
    ensureProfile(phone);
    return useProfileStore.getState().profile;
  }

  const res = await apiGetUserProfile(phone);
  if (res.ok) {
    useProfileStore.getState().setProfile(res.data);
    return res.data;
  }
  return useProfileStore.getState().profile;
}

export async function persistProfile(next: UserProfile): Promise<UserProfile> {
  const phone = useAuthStore.getState().phone;
  if (!phone) throw new Error("Not signed in");

  useProfileStore.getState().setProfile({ ...next, phone });

  if (!APPS_SCRIPT_URL) {
    return next;
  }

  const res = await apiUpdateProfile({
    phone,
    name: next.name,
    addresses: next.addresses,
    favorites: next.favorites,
  });

  if (res.ok) {
    useProfileStore.getState().setProfile(res.data);
    return res.data;
  }

  return next;
}
