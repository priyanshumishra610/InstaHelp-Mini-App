import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useAuthStore } from "@/store/authStore";
import type { SavedAddress, UserProfile } from "@/types/user";

type ProfileState = {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  upsertAddress: (address: SavedAddress) => void;
  toggleFavorite: (serviceId: string) => void;
};

const seedProfile = (phone: string): UserProfile => ({
  phone,
  addresses: [
    {
      id: "home",
      label: "Home",
      line: "Add your home address in Profile",
    },
  ],
  favorites: ["cleaner", "driver"],
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
      toggleFavorite: (serviceId) =>
        set((s) => {
          const phone = useAuthStore.getState().phone;
          let profile = s.profile;
          if (!profile) {
            if (!phone) return s;
            profile = seedProfile(phone);
          }
          const has = profile.favorites.includes(serviceId);
          const favorites = has
            ? profile.favorites.filter((x) => x !== serviceId)
            : [...profile.favorites, serviceId];
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
