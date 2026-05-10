import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
  isAuthenticated: boolean;
  phone: string | null;
  sessionToken: string | null;
  setSession: (phone: string, sessionToken: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      phone: null,
      sessionToken: null,
      setSession: (phone, sessionToken) =>
        set({ isAuthenticated: true, phone, sessionToken }),
      signOut: () =>
        set({ isAuthenticated: false, phone: null, sessionToken: null }),
    }),
    {
      name: "instahelp-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        phone: s.phone,
        sessionToken: s.sessionToken,
      }),
    },
  ),
);
