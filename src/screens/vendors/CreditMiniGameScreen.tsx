import { Screen } from "@/components/ui/Screen";
import { MiniGameWinOverlay } from "@/components/vendors/MiniGameWinOverlay";
import {
  BONUS_GAME_TIC_TAC_TOE_CREDITS,
} from "@/constants/vendorMarketplace";
import { useGameOpenCreditOnMount } from "@/hooks/useGameOpenCredit";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { calendarDayKey } from "@/utils/calendarDay";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type Cell = 0 | 1 | -1;

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function emptyBoard(): Cell[] {
  return Array.from({ length: 9 }, () => 0 as Cell);
}

function winnerFor(board: Cell[]): 1 | -1 | "draw" | null {
  for (const [a, b, c] of LINES) {
    const sum = board[a] + board[b] + board[c];
    if (sum === 3) return 1;
    if (sum === -3) return -1;
  }
  if (board.every((v) => v !== 0)) return "draw";
  return null;
}

/** Simple bot: tries to finish, block, grab center/corners */
function aiMove(board: Cell[]): number {
  const empties = board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);

  const forcingIndex = (mark: -1 | 1) => {
    for (const [a, b, c] of LINES) {
      const cells = [a, b, c];
      let sum = 0;
      let zero = -1;
      for (const i of cells) {
        if (board[i] === 0) {
          if (zero >= 0) return null;
          zero = i;
        }
        sum += board[i];
      }
      if (zero < 0) continue;
      if (sum === 2 * mark) return zero;
    }
    return null;
  };

  const fin = forcingIndex(-1);
  if (fin != null) return fin;
  const blk = forcingIndex(1);
  if (blk != null) return blk;
  if (board[4] === 0) return 4;
  for (const i of [0, 2, 6, 8, 1, 3, 5, 7]) {
    if (board[i] === 0) return i;
  }
  return empties[0]!;
}

const CARD_SHADOW_IOS = {
  shadowColor: "#002451",
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.12,
  shadowRadius: 28,
};
const SOFT_SHADOW_IOS = {
  shadowColor: "#004aad",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
};

export function CreditMiniGameScreen() {
  useGameOpenCreditOnMount("Insta Grid");
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const tryAwardTicTacToeBonus = useVendorLeadStore(
    (s) => s.tryAwardTicTacToeBonus,
  );
  const bonusAwardDay = useVendorLeadStore((s) => s.bonusTicTacToeAwardDayKey);
  const credits = useVendorLeadStore((s) => s.credits);

  const today = calendarDayKey();
  const claimedToday = bonusAwardDay === today;

  const [board, setBoard] = useState<Cell[]>(() => emptyBoard());
  const [phase, setPhase] = useState<"playing" | "user_won" | "ai_won" | "draw">(
    "playing",
  );
  const [winBurstKey, setWinBurstKey] = useState(0);

  useEffect(() => {
    if (phase === "user_won") setWinBurstKey((k) => k + 1);
  }, [phase]);

  const cellGap = 11;
  const boardMax = Math.min(windowWidth - 40, 308);
  const cellSize = Math.max(
    64,
    Math.floor((boardMax - cellGap * 2) / 3),
  );
  const boardWidth = cellSize * 3 + cellGap * 2;

  const finish = useCallback(
    (final: Cell[], outcome: typeof phase, shouldTryAwardBonus: boolean) => {
      setBoard(final);
      setPhase(outcome);
      if (outcome === "user_won") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (shouldTryAwardBonus) {
          const res = tryAwardTicTacToeBonus();
          if (res.ok) {
            Alert.alert(
              "Grid",
              `+${BONUS_GAME_TIC_TAC_TOE_CREDITS} credits`,
            );
          } else if (res.reason === "already_claimed_today") {
            Alert.alert("Grid", "Bonus already claimed — nice win.");
          }
        }
        return;
      }
      if (outcome === "ai_won") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (outcome === "draw") {
        void Haptics.selectionAsync().catch(() => {});
      }
    },
    [tryAwardTicTacToeBonus],
  );

  const onTapCell = (index: number) => {
    if (phase !== "playing" || board[index] !== 0) return;
    let next = board.slice() as Cell[];
    next[index] = 1;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    let w = winnerFor(next);
    if (w === 1) {
      finish(next, "user_won", !claimedToday);
      return;
    }
    if (w === "draw") {
      finish(next, "draw", false);
      return;
    }

    next = next.slice() as Cell[];
    next[aiMove(next)] = -1;
    w = winnerFor(next);
    if (w === -1) {
      finish(next, "ai_won", false);
      return;
    }
    if (w === "draw") {
      finish(next, "draw", false);
      return;
    }
    setBoard(next);
  };

  const reset = () => {
    setBoard(emptyBoard());
    setPhase("playing");
    void Haptics.selectionAsync().catch(() => {});
  };

  const subtitle = useMemo(() => {
    if (claimedToday) {
      return `Practice · you ✕ vs bot ○`;
    }
    return `Beat the bot · +${BONUS_GAME_TIC_TAC_TOE_CREDITS} credits once/day`;
  }, [claimedToday]);

  const statusMeta = useMemo(() => {
    if (phase === "playing") {
      return {
        icon: "hand-left-outline" as const,
        label: "Your turn",
        tint: "#004aad",
      };
    }
    if (phase === "user_won") {
      return {
        icon: "trophy-outline" as const,
        label: "You won!",
        tint: claimedToday ? "#059669" : "#004aad",
      };
    }
    if (phase === "ai_won") {
      return {
        icon: "flame-outline" as const,
        label: "Bot wins",
        tint: "#dc2626",
      };
    }
    return {
      icon: "git-merge-outline" as const,
      label: "Draw",
      tint: "#b45309",
    };
  }, [phase, claimedToday]);

  return (
    <Screen className="bg-[#eef2fb]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pt-2">
          <Animated.View
            entering={FadeInDown.duration(420).springify().damping(18)}
          >
            <LinearGradient
              colors={["#ffffff", "#f4f8ff"]}
              className="overflow-hidden rounded-[28px] border border-white p-px"
              style={
                Platform.OS === "ios" ? CARD_SHADOW_IOS : { elevation: 6 }
              }
            >
              <View className="overflow-hidden rounded-[27px]">
                <LinearGradient
                  colors={["#004aad", "#0066FF", "#0066FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-5 pb-10 pt-5"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/90">
                      Insta Grid
                    </Text>
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/18">
                      <Ionicons name="grid-outline" size={20} color="#ffffff" />
                    </View>
                  </View>

                  <Text className="mt-3 font-black tracking-tight text-white" style={{ fontSize: 26, lineHeight: 30 }}>
                    You ✕ · Bot ○
                  </Text>
                  <Text className="mt-1.5 text-[13px] font-medium leading-5 text-white/88">
                    {subtitle}
                  </Text>
                </LinearGradient>

                <View className="-mt-7 mx-3 mb-3 rounded-[20px] bg-white p-3"
                  style={Platform.OS === "ios" ? SOFT_SHADOW_IOS : { elevation: 3 }}
                >
                  <View className="flex-row flex-wrap gap-2">
                    <View className="min-w-[46%] flex-1 flex-row items-center gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/80 px-3 py-2">
                      <Ionicons name="wallet-outline" size={18} color="#004aad" />
                      <Text className="text-[14px] font-extrabold text-neutral-800">
                        {credits} cr
                      </Text>
                    </View>

                    <View
                      className={`min-w-[46%] flex-1 flex-row items-center gap-2 rounded-2xl px-3 py-2 ${claimedToday ? "border border-emerald-100 bg-emerald-50" : "border border-brand-gold/35 bg-brand-goldSoft/90"}`}
                    >
                      <Ionicons
                        name={claimedToday ? "checkmark-done" : "gift-outline"}
                        size={18}
                        color={claimedToday ? "#059669" : "#b88a00"}
                      />
                      <Text
                        className={`flex-1 text-[12px] font-extrabold ${claimedToday ? "text-emerald-800" : "text-brand-goldDeep"}`}
                      >
                        {claimedToday ? "Daily ✓" : `+${BONUS_GAME_TIC_TAC_TOE_CREDITS} / day`}
                      </Text>
                    </View>
                  </View>

                  {phase !== "playing" && phase !== "user_won" ? (
                    <View className="mt-2 rounded-xl border border-accent-tint bg-accent-soft/60 px-2 py-2">
                      <Text className="text-center text-[11px] font-extrabold text-accent-deep">
                        {phase === "ai_won" ? "Bot wins" : "Draw"}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(110).springify().damping(17)}
            className="mt-4 items-center"
          >
            <View className="relative w-full items-center">
              <LinearGradient
                colors={["#061a42", "#0c2f6e", "#123f8a"]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[32px] p-[5px]"
                style={
                  Platform.OS === "ios"
                    ? {
                        shadowColor: "#001229",
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.35,
                        shadowRadius: 28,
                      }
                    : { elevation: 10 }
                }
              >
                <LinearGradient
                  colors={["#e4ecfc", "#d5e4fa", "#c8dbf7"]}
                  className="overflow-hidden rounded-[28px] p-[14px]"
                >
                  <View
                    style={{
                      width: boardWidth,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: cellGap,
                    }}
                  >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                    const mark = board[i];
                    const disabled =
                      phase !== "playing" || mark !== 0;
                    return (
                      <Pressable
                        key={i}
                        accessibilityRole="button"
                        accessibilityLabel={`Square ${i + 1}`}
                        onPress={() => onTapCell(i)}
                        disabled={disabled}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        className={`rounded-[18px] border ${
                          disabled && mark === 0
                            ? "border-neutral-100/70 bg-neutral-100/85"
                            : mark === 0
                              ? "border-white/95 bg-white shadow-md shadow-black/08 active:opacity-85"
                              : "border-white bg-white shadow-lg shadow-accent/14"
                        }`}
                      >
                        {mark === 1 ? (
                          <Text
                            style={{
                              fontSize: Math.min(42, Math.floor(cellSize * 0.52)),
                              lineHeight:
                                Math.min(42, Math.floor(cellSize * 0.52)) + 2,
                              textShadowColor: "rgba(0,74,173,0.22)",
                              textShadowOffset: { width: 0, height: 2 },
                              textShadowRadius: 6,
                            }}
                            className="font-black text-accent"
                          >
                            ✕
                          </Text>
                        ) : mark === -1 ? (
                          <Text
                            style={{
                              fontSize: Math.min(40, Math.floor(cellSize * 0.49)),
                              lineHeight:
                                Math.min(40, Math.floor(cellSize * 0.49)) + 2,
                              textShadowColor: "rgba(5,150,105,0.2)",
                              textShadowOffset: { width: 0, height: 2 },
                              textShadowRadius: 6,
                            }}
                            className="font-black text-emerald-600"
                          >
                            ○
                          </Text>
                        ) : (
                          <View className="h-[28%] w-[28%] rounded-xl bg-accent/12" />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
                </LinearGradient>
              </LinearGradient>

              <MiniGameWinOverlay
                show={phase === "user_won"}
                burstKey={winBurstKey}
                tone="accent"
                subline={`+${BONUS_GAME_TIC_TAC_TOE_CREDITS} credits`}
              />
            </View>

            <View
              className="mt-6 w-full flex-row items-center gap-3 rounded-[20px] border border-white bg-white px-4 py-3"
              style={Platform.OS === "ios" ? SOFT_SHADOW_IOS : { elevation: 2 }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${statusMeta.tint}18` }}
              >
                <Ionicons name={statusMeta.icon} size={20} color={statusMeta.tint} />
              </View>
              <Text className="flex-1 text-[14px] font-extrabold text-neutral-900">
                {statusMeta.label}
              </Text>
            </View>

            <LinearGradient
              colors={["#004aad", "#003780"]}
              className="mt-8 overflow-hidden rounded-full"
              style={
                Platform.OS === "ios"
                  ? {
                      shadowColor: "#004aad",
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.35,
                      shadowRadius: 16,
                    }
                  : { elevation: 5 }
              }
            >
              <Pressable
                onPress={reset}
                className="px-14 py-4 active:opacity-90"
              >
                <Text className="text-center text-[16px] font-extrabold text-accent-foreground">
                  {phase === "playing" ? "Reset board" : "Play again"}
                </Text>
              </Pressable>
            </LinearGradient>

            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              className="mx-auto mt-4 flex-row items-center gap-2 rounded-full border border-accent/20 bg-white/90 px-5 py-2.5 active:opacity-85"
              style={
                Platform.OS === "ios" ? SOFT_SHADOW_IOS : { elevation: 2 }
              }
            >
              <Ionicons name="arrow-back" size={18} color="#004aad" />
              <Text className="text-[13px] font-extrabold text-accent-deep">
                Arcade
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}
