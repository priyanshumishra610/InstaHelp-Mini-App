import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OnboardingState = {
  /** Local guest session (no Clerk account). */
  isGuest: boolean;
  enterGuestMode: () => void;
  clearGuest: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isGuest: false,
      enterGuestMode: () => set({ isGuest: true }),
      clearGuest: () => set({ isGuest: false }),
    }),
    {
      name: "instahelp-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ isGuest: s.isGuest }),
    },
  ),
);
