import {
  REWARDED_AD_CREDIT_REWARD,
  REWARDED_AD_DAILY_MAX,
} from "@/constants/admob";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { calendarDayKey } from "@/utils/calendarDay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AdWatchClaimResult =
  | { ok: true; amount: number; remainingToday: number }
  | { ok: false; reason: "daily_cap" };

type AdRewardsState = {
  adWatchDayKey: string | null;
  adWatchesToday: number;
  remainingAdWatchesToday: () => number;
  tryClaimAdWatchReward: () => AdWatchClaimResult;
};

function normalizeDay(s: AdRewardsState): {
  dayKey: string;
  watches: number;
} {
  const dayKey = calendarDayKey();
  if (s.adWatchDayKey !== dayKey) {
    return { dayKey, watches: 0 };
  }
  return { dayKey, watches: s.adWatchesToday };
}

export const useAdRewardsStore = create<AdRewardsState>()(
  persist(
    (set, get) => ({
      adWatchDayKey: null,
      adWatchesToday: 0,

      remainingAdWatchesToday: () => {
        const { watches } = normalizeDay(get());
        return Math.max(0, REWARDED_AD_DAILY_MAX - watches);
      },

      tryClaimAdWatchReward: () => {
        const { dayKey, watches } = normalizeDay(get());
        if (watches >= REWARDED_AD_DAILY_MAX) {
          return { ok: false, reason: "daily_cap" };
        }

        const amount = REWARDED_AD_CREDIT_REWARD;
        const nextWatches = watches + 1;
        useVendorLeadStore
          .getState()
          .addCredits(amount, "Rewarded ad watch");

        set({
          adWatchDayKey: dayKey,
          adWatchesToday: nextWatches,
        });

        return {
          ok: true,
          amount,
          remainingToday: Math.max(0, REWARDED_AD_DAILY_MAX - nextWatches),
        };
      },
    }),
    {
      name: "instahelp-ad-rewards",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        adWatchDayKey: s.adWatchDayKey,
        adWatchesToday: s.adWatchesToday,
      }),
    },
  ),
);
