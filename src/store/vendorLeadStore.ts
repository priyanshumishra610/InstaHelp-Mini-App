import {
  BONUS_GAME_HANGMAN_CREDITS,
  BONUS_GAME_TIC_TAC_TOE_CREDITS,
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

const STORAGE_VERSION = 2;

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

type VendorLeadPersistedBonusSlice = {
  bonusTicTacToeAwardDayKey: string | null;
  bonusHangmanAwardDayKey: string | null;
  bonusWhackEasyDayKey: string | null;
  bonusWhackMediumDayKey: string | null;
  bonusWhackHardDayKey: string | null;
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
        transactions: s.transactions.slice(0, MAX_TX),
      }),
    },
  ),
);

/** @deprecated Use useVendorLeadStore — kept for naming clarity per product spec. */
export const useVendorCreditsStore = useVendorLeadStore;
