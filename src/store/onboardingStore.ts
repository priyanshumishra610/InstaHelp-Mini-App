import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OnboardingState = {
  /** Local guest session (no phone sign-in). */
  isGuest: boolean;
  /** Allow signed-in users to skip profile completion temporarily. */
  deferProfile: boolean;
  /** First-run in-app tutorial completed (or skipped). */
  appTutorialCompleted: boolean;
  /** Start the interactive tour after the user reaches the main tabs. */
  pendingInAppTutorial: boolean;
  enterGuestMode: () => void;
  clearGuest: () => void;
  setDeferProfile: (next: boolean) => void;
  completeAppTutorial: () => void;
  setPendingInAppTutorial: (next: boolean) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isGuest: false,
      deferProfile: false,
      appTutorialCompleted: false,
      pendingInAppTutorial: false,
      enterGuestMode: () => set({ isGuest: true }),
      clearGuest: () => set({ isGuest: false }),
      setDeferProfile: (next) => set({ deferProfile: next }),
      completeAppTutorial: () => set({ appTutorialCompleted: true, pendingInAppTutorial: false }),
      setPendingInAppTutorial: (next) => set({ pendingInAppTutorial: next }),
    }),
    {
      name: "instahelp-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        isGuest: s.isGuest,
        deferProfile: s.deferProfile,
        appTutorialCompleted: s.appTutorialCompleted,
        pendingInAppTutorial: s.pendingInAppTutorial,
      }),
    },
  ),
);
