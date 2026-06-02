import {
  BONUS_GAME_HANGMAN_CREDITS,
  BONUS_GAME_TIC_TAC_TOE_CREDITS,
  GAME_OPEN_CREDIT_REWARD,
  GAME_OPEN_DAILY_MAX_CREDITS,
  VENDOR_INITIAL_CREDITS,
  VENDOR_REVEAL_CREDIT_COST,
  WHACK_LEVEL_CONFIG,
  type WhackDifficulty,
} from "@/constants/vendorMarketplace";
import type { CreditTransaction } from "@/types/vendorMarketplace";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calendarDayKey } from "@/utils/calendarDay";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_TX = 100;

const STORAGE_VERSION = 3;

function newTx(partial: Omit<CreditTransaction, "id" | "createdAt">): CreditTransaction {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: Date.now(),
    ...partial,
  };
}

export type VendorRevealResult =
  | { ok: true; alreadyUnlocked?: boolean }
  | { ok: false; reason: "insufficient_credits" };

export type BonusGameAwardResult =
  | { ok: true }
  | { ok: false; reason: "already_claimed_today" };

export type GameOpenCreditResult =
  | { ok: true; amount: number; opensRemaining: number }
  | { ok: false; reason: "daily_cap" };

type VendorLeadPersistedBonusSlice = {
  bonusTicTacToeAwardDayKey: string | null;
  bonusHangmanAwardDayKey: string | null;
  bonusWhackEasyDayKey: string | null;
  bonusWhackMediumDayKey: string | null;
  bonusWhackHardDayKey: string | null;
  gameOpenCreditsDayKey: string | null;
  gameOpenCreditsAwardedToday: number;
};

type VendorLeadState = VendorLeadPersistedBonusSlice & {
  credits: number;
  unlockedVendorIds: string[];
  transactions: CreditTransaction[];

  addCredits: (amount: number, note: string) => void;
  deductCredits: (amount: number, note: string, vendorId?: string) => boolean;
  hasEnoughCredits: (amount: number) => boolean;

  /** Win Insta Grid — + credits at most once per local calendar day (server will enforce later). */
  tryAwardTicTacToeBonus: () => BonusGameAwardResult;

  tryAwardHangmanBonus: () => BonusGameAwardResult;

  /** Win Whack-a-mole tier — separate daily slot per difficulty. */
  tryAwardWhackAMoleBonus: (level: WhackDifficulty) => BonusGameAwardResult;

  /** +10 vendor credits per game open, max 50/day (5 opens). */
  tryAwardGameOpenCredit: (gameLabel: string) => GameOpenCreditResult;

  /** Idempotent reveal: spends credits once per vendor (persisted locally). */
  tryRevealVendor: (vendorId: string) => VendorRevealResult;
  isVendorUnlocked: (vendorId: string) => boolean;
};

export const useVendorLeadStore = create<VendorLeadState>()(
  persist(
    (set, get) => ({
      credits: VENDOR_INITIAL_CREDITS,
      unlockedVendorIds: [],
      bonusTicTacToeAwardDayKey: null,
      bonusHangmanAwardDayKey: null,
      bonusWhackEasyDayKey: null,
      bonusWhackMediumDayKey: null,
      bonusWhackHardDayKey: null,
      gameOpenCreditsDayKey: null,
      gameOpenCreditsAwardedToday: 0,
      transactions: [
        newTx({
          kind: "credit_add",
          delta: VENDOR_INITIAL_CREDITS,
          balanceAfter: VENDOR_INITIAL_CREDITS,
          note: "Welcome credits",
        }),
      ],

      hasEnoughCredits: (amount) => get().credits >= amount,

      tryAwardTicTacToeBonus: () => {
        const dayKey = calendarDayKey();
        const s = get();
        if (s.bonusTicTacToeAwardDayKey === dayKey) {
          return { ok: false, reason: "already_claimed_today" };
        }
        const bonus = BONUS_GAME_TIC_TAC_TOE_CREDITS;
        const balanceAfter = s.credits + bonus;
        const tx = newTx({
          kind: "credit_add",
          delta: bonus,
          balanceAfter,
          note: "Insta Grid win (daily bonus)",
        });
        set({
          credits: balanceAfter,
          bonusTicTacToeAwardDayKey: dayKey,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        });
        return { ok: true };
      },

      tryAwardHangmanBonus: () => {
        const dayKey = calendarDayKey();
        const s = get();
        if (s.bonusHangmanAwardDayKey === dayKey) {
          return { ok: false, reason: "already_claimed_today" };
        }
        const bonus = BONUS_GAME_HANGMAN_CREDITS;
        const balanceAfter = s.credits + bonus;
        const tx = newTx({
          kind: "credit_add",
          delta: bonus,
          balanceAfter,
          note: "Hangman win (daily bonus)",
        });
        set({
          credits: balanceAfter,
          bonusHangmanAwardDayKey: dayKey,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        });
        return { ok: true };
      },

      tryAwardWhackAMoleBonus: (level: WhackDifficulty) => {
        const dayKey = calendarDayKey();
        const s = get();
        const tierKeyProp =
          level === "easy"
            ? "bonusWhackEasyDayKey"
            : level === "medium"
              ? "bonusWhackMediumDayKey"
              : "bonusWhackHardDayKey";
        const lastDay = s[tierKeyProp];
        if (lastDay === dayKey) {
          return { ok: false, reason: "already_claimed_today" };
        }

        const bonus = WHACK_LEVEL_CONFIG[level].credits;
        const balanceAfter = s.credits + bonus;
        const tx = newTx({
          kind: "credit_add",
          delta: bonus,
          balanceAfter,
          note: `Whack-a-mole ${level} (daily bonus)`,
        });
        set({
          credits: balanceAfter,
          [tierKeyProp]: dayKey,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        });
        return { ok: true };
      },

      tryAwardGameOpenCredit: (gameLabel) => {
        const dayKey = calendarDayKey();
        const s = get();
        const awardedToday =
          s.gameOpenCreditsDayKey === dayKey ? s.gameOpenCreditsAwardedToday : 0;

        if (awardedToday >= GAME_OPEN_DAILY_MAX_CREDITS) {
          return { ok: false, reason: "daily_cap" };
        }

        const amount = Math.min(
          GAME_OPEN_CREDIT_REWARD,
          GAME_OPEN_DAILY_MAX_CREDITS - awardedToday,
        );
        const balanceAfter = s.credits + amount;
        const label = gameLabel.trim() || "Game";
        const tx = newTx({
          kind: "credit_add",
          delta: amount,
          balanceAfter,
          note: `Opened game: ${label}`,
        });
        const nextAwarded = awardedToday + amount;
        const opensRemaining = Math.max(
          0,
          Math.floor(
            (GAME_OPEN_DAILY_MAX_CREDITS - nextAwarded) / GAME_OPEN_CREDIT_REWARD,
          ),
        );
        set({
          credits: balanceAfter,
          gameOpenCreditsDayKey: dayKey,
          gameOpenCreditsAwardedToday: nextAwarded,
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        });
        return { ok: true, amount, opensRemaining };
      },

      addCredits: (amount, note) => {
        if (amount <= 0) return;
        set((s) => {
          const balanceAfter = s.credits + amount;
          const tx = newTx({
            kind: "credit_add",
            delta: amount,
            balanceAfter,
            note,
          });
          return {
            credits: balanceAfter,
            transactions: [tx, ...s.transactions].slice(0, MAX_TX),
          };
        });
      },

      deductCredits: (amount, note, vendorId) => {
        if (amount <= 0) return false;
        let did = false;
        set((s) => {
          if (s.credits < amount) return {};
          did = true;
          const balanceAfter = s.credits - amount;
          const tx = newTx({
            kind: "credit_deduct",
            delta: -amount,
            balanceAfter,
            vendorId,
            note,
          });
          return {
            credits: balanceAfter,
            transactions: [tx, ...s.transactions].slice(0, MAX_TX),
          };
        });
        return did;
      },

      isVendorUnlocked: (vendorId) =>
        get().unlockedVendorIds.includes(vendorId),

      tryRevealVendor: (vendorId) => {
        const s = get();
        if (s.unlockedVendorIds.includes(vendorId)) {
          return { ok: true, alreadyUnlocked: true };
        }
        if (s.credits < VENDOR_REVEAL_CREDIT_COST) {
          return { ok: false, reason: "insufficient_credits" };
        }
        const balanceAfter = s.credits - VENDOR_REVEAL_CREDIT_COST;
        const tx = newTx({
          kind: "credit_deduct",
          delta: -VENDOR_REVEAL_CREDIT_COST,
          balanceAfter,
          vendorId,
          note: "Vendor contact reveal",
        });
        set({
          credits: balanceAfter,
          unlockedVendorIds: [...s.unlockedVendorIds, vendorId],
          transactions: [tx, ...s.transactions].slice(0, MAX_TX),
        });
        return { ok: true };
      },
    }),
    {
      name: "instahelp-vendor-lead",
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, fromVersion: number | undefined): unknown => {
        const migrated = persisted as VendorLeadPersistedBonusSlice &
          Partial<{ bonusWhackAMoleAwardDayKey: string | null }> &
          Record<string, unknown>;

        if ((fromVersion ?? 0) < 2 && migrated?.bonusWhackAMoleAwardDayKey != null) {
          migrated.bonusWhackMediumDayKey ??= migrated.bonusWhackAMoleAwardDayKey;
        }
        delete migrated.bonusWhackAMoleAwardDayKey;
        migrated.bonusWhackEasyDayKey ??= null;
        migrated.bonusWhackMediumDayKey ??= null;
        migrated.bonusWhackHardDayKey ??= null;
        if ((fromVersion ?? 0) < 3) {
          migrated.gameOpenCreditsDayKey ??= null;
          migrated.gameOpenCreditsAwardedToday ??= 0;
        }
        return migrated;
      },
      partialize: (s): VendorLeadPersistedBonusSlice & Pick<VendorLeadState, "credits" | "unlockedVendorIds" | "transactions"> => ({
        credits: s.credits,
        unlockedVendorIds: s.unlockedVendorIds,
        bonusTicTacToeAwardDayKey: s.bonusTicTacToeAwardDayKey,
        bonusHangmanAwardDayKey: s.bonusHangmanAwardDayKey,
        bonusWhackEasyDayKey: s.bonusWhackEasyDayKey,
        bonusWhackMediumDayKey: s.bonusWhackMediumDayKey,
        bonusWhackHardDayKey: s.bonusWhackHardDayKey,
        gameOpenCreditsDayKey: s.gameOpenCreditsDayKey,
        gameOpenCreditsAwardedToday: s.gameOpenCreditsAwardedToday,
        transactions: s.transactions.slice(0, MAX_TX),
      }),
    },
  ),
);

/** @deprecated Use useVendorLeadStore — kept for naming clarity per product spec. */
export const useVendorCreditsStore = useVendorLeadStore;
