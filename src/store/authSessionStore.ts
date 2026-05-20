import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthSessionState = {
  phone: string | null;
  setPhone: (phone: string) => void;
  clearSession: () => void;
};

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      phone: null,
      setPhone: (phone) => set({ phone }),
      clearSession: () => set({ phone: null }),
    }),
    {
      name: "instahelp-auth-session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ phone: s.phone }),
    },
  ),
);
