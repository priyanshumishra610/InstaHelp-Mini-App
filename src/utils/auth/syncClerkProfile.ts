import { useProfileStore } from "@/store/profileStore";
import type { UserProfile } from "@/types/user";

type ClerkUserLike = {
  primaryPhoneNumber?: { phoneNumber: string } | null;
  phoneNumbers?: { phoneNumber: string }[];
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
};

export function clerkDisplayName(user: ClerkUserLike | null | undefined): string {
  if (!user) return "";
  const full = user.fullName?.trim();
  if (full) return full;
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
}

export function clerkPrimaryPhone(user: ClerkUserLike | null | undefined): string {
  if (!user) return "";
  return (
    user.primaryPhoneNumber?.phoneNumber ??
    user.phoneNumbers?.[0]?.phoneNumber ??
    ""
  );
}

/** Merge Clerk identity into the local profile store without wiping addresses. */
export function syncClerkUserToProfile(user: ClerkUserLike | null | undefined): void {
  const phone = clerkPrimaryPhone(user);
  if (!phone) return;

  const name = clerkDisplayName(user);
  const { profile, setProfile } = useProfileStore.getState();

  if (profile && profile.phone === phone) {
    if (name && !profile.name?.trim()) {
      setProfile({ ...profile, name });
    }
    return;
  }

  const next: UserProfile = {
    phone,
    name: name || profile?.name,
    addresses: profile?.addresses?.length
      ? profile.addresses
      : [
          {
            id: "home",
            label: "Home",
            line: "Add your home address in Profile",
          },
        ],
    favorites: profile?.favorites ?? [],
    avatarUri: profile?.avatarUri,
    role: profile?.role,
  };
  setProfile(next);
}
