import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_ACCENT_ID,
  DEFAULT_COLOR_SCHEME,
  type AccentId,
  type ColorSchemePreference,
} from "@/constants/appearance";

type ThemeState = {
  colorScheme: ColorSchemePreference;
  accentId: AccentId;
  setColorScheme: (next: ColorSchemePreference) => void;
  setAccentId: (next: AccentId) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: DEFAULT_COLOR_SCHEME,
      accentId: DEFAULT_ACCENT_ID,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setAccentId: (accentId) => set({ accentId }),
    }),
    {
      name: "instahelp-appearance",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<ThemeState>;
        // Prefer bright paper by default; keep explicit Dark if the user chose it.
        const colorScheme =
          state.colorScheme === "dark" ? "dark" : DEFAULT_COLOR_SCHEME;
        return {
          colorScheme,
          accentId: state.accentId ?? DEFAULT_ACCENT_ID,
        };
      },
      partialize: (s) => ({
        colorScheme: s.colorScheme,
        accentId: s.accentId,
      }),
    },
  ),
);
