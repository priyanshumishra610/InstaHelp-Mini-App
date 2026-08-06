import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SavedAddress, UserProfile } from "@/types/user";

type ProfileState = {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  upsertAddress: (address: SavedAddress) => void;
  removeAddress: (addressId: string) => void;
  toggleFavorite: (serviceId: string) => void;
};

const seedProfile = (phone: string): UserProfile => ({
  phone,
  age: null,
  gender: null,
  city: null,
  email: null,
  birthday: null,
  anniversary: null,
  avatarSeed: Math.random().toString(36).slice(2, 10),
  addresses: [],
  favorites: [],
});

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      upsertAddress: (address) =>
        set((s) => {
          if (!s.profile) return s;
          const others = s.profile.addresses.filter((a) => a.id !== address.id);
          return {
            profile: {
              ...s.profile,
              addresses: [...others, address],
            },
          };
        }),
      removeAddress: (addressId) =>
        set((s) => {
          if (!s.profile) return s;
          return {
            profile: {
              ...s.profile,
              addresses: s.profile.addresses.filter((a) => a.id !== addressId),
            },
          };
        }),
      toggleFavorite: (serviceId) =>
        set((s) => {
          const profile = s.profile;
          if (!profile) return s;
          const current = profile.favorites ?? [];
          const has = current.includes(serviceId);
          const favorites = has
            ? current.filter((x) => x !== serviceId)
            : [...current, serviceId];
          return { profile: { ...profile, favorites } };
        }),
    }),
    {
      name: "instahelp-profile",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profile: s.profile }),
    },
  ),
);

export function ensureProfile(phone: string) {
  const { profile, setProfile } = useProfileStore.getState();
  if (!profile || profile.phone !== phone) {
    setProfile(seedProfile(phone));
  }
}
