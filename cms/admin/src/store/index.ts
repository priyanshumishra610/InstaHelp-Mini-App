import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "instahelp-cms-auth" },
  ),
);

interface PreviewState {
  screen: "home" | "shop" | "deals" | "profile";
  device: "android" | "iphone" | "tablet";
  theme: "light" | "dark";
  setScreen: (screen: PreviewState["screen"]) => void;
  setDevice: (device: PreviewState["device"]) => void;
  setTheme: (theme: PreviewState["theme"]) => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  screen: "home",
  device: "iphone",
  theme: "light",
  setScreen: (screen) => set({ screen }),
  setDevice: (device) => set({ device }),
  setTheme: (theme) => set({ theme }),
}));
