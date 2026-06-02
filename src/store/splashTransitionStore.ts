import type { AuthDestination } from "@/utils/auth/session";
import { create } from "zustand";

type SplashTransitionState = {
  /** Overlay visible on cold start (index route). */
  active: boolean;
  minElapsed: boolean;
  destination: AuthDestination | null;
  exitStarted: boolean;
  activate: () => void;
  setDestination: (destination: AuthDestination) => void;
  markMinElapsed: () => void;
  beginExit: () => void;
  finish: () => void;
};

export const useSplashTransitionStore = create<SplashTransitionState>((set) => ({
  active: false,
  minElapsed: false,
  destination: null,
  exitStarted: false,
  activate: () =>
    set({
      active: true,
      minElapsed: false,
      destination: null,
      exitStarted: false,
    }),
  setDestination: (destination) => set({ destination }),
  markMinElapsed: () => set({ minElapsed: true }),
  beginExit: () => set({ exitStarted: true }),
  finish: () =>
    set({
      active: false,
      minElapsed: false,
      destination: null,
      exitStarted: false,
    }),
}));
