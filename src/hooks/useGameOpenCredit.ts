import {
  GAME_OPEN_CREDIT_REWARD,
  GAME_OPEN_DAILY_MAX_COUNT,
  GAME_OPEN_DAILY_MAX_CREDITS,
} from "@/constants/vendorMarketplace";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

export type GameOpenCreditAward =
  | { ok: true; amount: number; opensRemaining: number }
  | { ok: false; reason: "daily_cap" };

export function awardGameOpenCredit(gameLabel: string): GameOpenCreditAward {
  return useVendorLeadStore.getState().tryAwardGameOpenCredit(gameLabel);
}

export function notifyGameOpenCredit(result: GameOpenCreditAward, gameLabel: string) {
  if (result.ok) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    const opensNote =
      result.opensRemaining > 0
        ? `${result.opensRemaining} more open${result.opensRemaining === 1 ? "" : "s"} today (${GAME_OPEN_CREDIT_REWARD} credits each, ${GAME_OPEN_DAILY_MAX_CREDITS} max).`
        : "You've reached today's play reward limit — games stay open!";
    Alert.alert(
      `+${result.amount} credits`,
      `Thanks for playing ${gameLabel}. ${opensNote}`,
    );
    return;
  }
  if (result.reason === "daily_cap") {
    Alert.alert(
      "Daily limit reached",
      `You've earned ${GAME_OPEN_DAILY_MAX_CREDITS} credits from ${GAME_OPEN_DAILY_MAX_COUNT} game opens today. Keep playing for fun!`,
    );
  }
}

/** Award +10 vendor credits once when a game screen or player opens. */
export function useGameOpenCreditOnMount(gameLabel: string) {
  const awardedRef = useRef(false);

  useEffect(() => {
    if (awardedRef.current) return;
    awardedRef.current = true;
    const result = awardGameOpenCredit(gameLabel);
    if (result.ok || result.reason === "daily_cap") {
      notifyGameOpenCredit(result, gameLabel);
    }
  }, [gameLabel]);
}
