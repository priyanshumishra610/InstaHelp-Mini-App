import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OnboardingState = {
  /** Local guest session (no phone sign-in). */
  isGuest: boolean;
  /** Allow signed-in users to skip profile completion temporarily. */
  deferProfile: boolean;
  enterGuestMode: () => void;
  clearGuest: () => void;
  setDeferProfile: (next: boolean) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isGuest: false,
      deferProfile: false,
      enterGuestMode: () => set({ isGuest: true }),
      clearGuest: () => set({ isGuest: false }),
      setDeferProfile: (next) => set({ deferProfile: next }),
    }),
    {
      name: "instahelp-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ isGuest: s.isGuest, deferProfile: s.deferProfile }),
    },
  ),
);
