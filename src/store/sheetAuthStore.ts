import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SheetAuthState = {
  /** E.164 India, e.g. +91XXXXXXXXXX */
  phone: string | null;
  setPhone: (phone: string) => void;
  clearPhone: () => void;
};

export const useSheetAuthStore = create<SheetAuthState>()(
  persist(
    (set) => ({
      phone: null,
      setPhone: (phone) => set({ phone }),
      clearPhone: () => set({ phone: null }),
    }),
    {
      name: "instahelp-sheet-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ phone: s.phone }),
    },
  ),
);
