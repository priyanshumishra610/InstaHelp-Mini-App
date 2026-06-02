import {
  apiGetUserProfile,
  apiUpdateProfile,
} from "@/api/appsScriptClient";
import { APPS_SCRIPT_URL } from "@/api/env";
import { getAuthPhone } from "@/utils/auth/getAuthPhone";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import type { UserProfile } from "@/types/user";
import { resolveProfileDisplayName } from "@/utils/auth/session";

export async function refreshProfile(): Promise<UserProfile | null> {
  const phone = getAuthPhone();
  if (!phone) return null;

  if (!APPS_SCRIPT_URL) {
    ensureProfile(phone);
    return useProfileStore.getState().profile;
  }

  const res = await apiGetUserProfile(phone);
  if (res.ok) {
    const prev = useProfileStore.getState().profile;
    const samePhone = prev?.phone === res.data.phone;
    useProfileStore.getState().setProfile({
      ...res.data,
      name:
        res.data.name?.trim() ||
        (samePhone ? prev?.name?.trim() : undefined) ||
        resolveProfileDisplayName(prev, res.data.phone),
      age: res.data.age ?? (samePhone ? prev?.age : undefined),
      gender: res.data.gender ?? (samePhone ? prev?.gender : undefined),
      city: res.data.city?.trim() || (samePhone ? prev?.city?.trim() : undefined) || null,
      avatarUri: samePhone ? prev?.avatarUri : undefined,
      role: res.data.role ?? (samePhone ? prev?.role : undefined),
      preferredContact:
        res.data.preferredContact ?? (samePhone ? prev?.preferredContact : undefined),
    });
    return useProfileStore.getState().profile;
  }
  return useProfileStore.getState().profile;
}

export async function persistProfile(next: UserProfile): Promise<UserProfile> {
  const phone = getAuthPhone();
  if (!phone) throw new Error("Not signed in");

  useProfileStore.getState().setProfile({ ...next, phone });

  if (!APPS_SCRIPT_URL) {
    return next;
  }

  const res = await apiUpdateProfile({
    phone,
    name: next.name,
    age: next.age ?? null,
    gender: next.gender ?? null,
    city: next.city?.trim() || null,
    email: next.email ?? null,
    birthday: next.birthday ?? null,
    anniversary: next.anniversary ?? null,
    addresses: next.addresses,
    favorites: next.favorites,
  });

  if (res.ok) {
    useProfileStore.getState().setProfile({
      ...res.data,
      age: res.data.age ?? next.age,
      gender: res.data.gender ?? next.gender,
      city: res.data.city ?? next.city,
      avatarUri: next.avatarUri,
      role: next.role,
      preferredContact: next.preferredContact,
    });
    return useProfileStore.getState().profile as UserProfile;
  }

  return next;
}
