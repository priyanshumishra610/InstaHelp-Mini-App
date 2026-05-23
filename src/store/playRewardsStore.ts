import AsyncStorage from "@react-native-async-storage/async-storage";
import { calendarDayKey } from "@/utils/calendarDay";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PlayRewardsState = {
  playCoins: number;
  streakDays: number;
  lastPlayDayKey: string | null;
  dailyRewardClaimedDayKey: string | null;
  weeklyChallengeProgress: number;
  gamesPlayedToday: number;
  addPlayCoins: (amount: number) => void;
  recordGameSession: (rewardCoins: number) => void;
  claimDailyReward: () => { ok: true; amount: number } | { ok: false; reason: "already_claimed" };
};

const DAILY_REWARD = 25;
const WEEKLY_TARGET = 7;

export const usePlayRewardsStore = create<PlayRewardsState>()(
  persist(
    (set, get) => ({
      playCoins: 120,
      streakDays: 3,
      lastPlayDayKey: calendarDayKey(),
      dailyRewardClaimedDayKey: null,
      weeklyChallengeProgress: 4,
      gamesPlayedToday: 0,

      addPlayCoins: (amount) =>
        set((s) => ({ playCoins: s.playCoins + Math.max(0, amount) })),

      recordGameSession: (rewardCoins) => {
        const today = calendarDayKey();
        const { lastPlayDayKey, streakDays, gamesPlayedToday } = get();
        let nextStreak = streakDays;
        if (lastPlayDayKey !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yKey = calendarDayKey(yesterday);
          nextStreak = lastPlayDayKey === yKey ? streakDays + 1 : 1;
        }
        const nextWeekly = Math.min(
          WEEKLY_TARGET,
          get().weeklyChallengeProgress + 1,
        );
        set({
          playCoins: get().playCoins + rewardCoins,
          lastPlayDayKey: today,
          streakDays: nextStreak,
          gamesPlayedToday: lastPlayDayKey === today ? gamesPlayedToday + 1 : 1,
          weeklyChallengeProgress: nextWeekly,
        });
      },

      claimDailyReward: () => {
        const today = calendarDayKey();
        if (get().dailyRewardClaimedDayKey === today) {
          return { ok: false, reason: "already_claimed" };
        }
        set((s) => ({
          playCoins: s.playCoins + DAILY_REWARD,
          dailyRewardClaimedDayKey: today,
        }));
        return { ok: true, amount: DAILY_REWARD };
      },
    }),
    {
      name: "instahelp-play-rewards",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        playCoins: s.playCoins,
        streakDays: s.streakDays,
        lastPlayDayKey: s.lastPlayDayKey,
        dailyRewardClaimedDayKey: s.dailyRewardClaimedDayKey,
        weeklyChallengeProgress: s.weeklyChallengeProgress,
        gamesPlayedToday: s.gamesPlayedToday,
      }),
    },
  ),
);

export { DAILY_REWARD, WEEKLY_TARGET };
