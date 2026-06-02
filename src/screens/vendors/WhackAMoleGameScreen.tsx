import { Screen } from "@/components/ui/Screen";
import { MiniGameWinOverlay } from "@/components/vendors/MiniGameWinOverlay";
import {
  WHACK_LEVEL_CONFIG,
  type WhackDifficulty,
} from "@/constants/vendorMarketplace";
import { useGameOpenCreditOnMount } from "@/hooks/useGameOpenCredit";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { calendarDayKey } from "@/utils/calendarDay";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

type Phase = "pick" | "countdown" | "playing" | "ended";

const LEVEL_ORDER: WhackDifficulty[] = ["easy", "medium", "hard"];

function whackDayKeyForDifficulty(
  d: WhackDifficulty,
  s: {
    bonusWhackEasyDayKey: string | null;
    bonusWhackMediumDayKey: string | null;
    bonusWhackHardDayKey: string | null;
  },
): string | null {
  if (d === "easy") return s.bonusWhackEasyDayKey;
  if (d === "medium") return s.bonusWhackMediumDayKey;
  return s.bonusWhackHardDayKey;
}

export function WhackAMoleGameScreen() {
  useGameOpenCreditOnMount("Whack-a-mole");
  const tryAwardWhackBonus = useVendorLeadStore(
    (s) => s.tryAwardWhackAMoleBonus,
  );
  const credits = useVendorLeadStore((s) => s.credits);

  const difficultyRef = useRef<WhackDifficulty>("medium");
  const roundConfigRef = useRef(WHACK_LEVEL_CONFIG.medium);

  const scoreRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const spawnGenerationRef = useRef(0);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current = [];
    intervalsRef.current = [];
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const [difficulty, setDifficulty] = useState<WhackDifficulty>("medium");
  const [phase, setPhase] = useState<Phase>("pick");
  const [countTap, setCountTap] = useState(3);
  const [timeLeftSec, setTimeLeftSec] = useState(
    WHACK_LEVEL_CONFIG.medium.roundSeconds,
  );
  const [score, setScore] = useState(0);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [winBurstKey, setWinBurstKey] = useState(0);
  const [lastQualified, setLastQualified] = useState(false);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const bonusWhackEasy = useVendorLeadStore((s) => s.bonusWhackEasyDayKey);
  const bonusWhackMedium = useVendorLeadStore((s) => s.bonusWhackMediumDayKey);
  const bonusWhackHard = useVendorLeadStore((s) => s.bonusWhackHardDayKey);

  const cfg = WHACK_LEVEL_CONFIG[difficulty];
  const today = calendarDayKey();
  const claimedThisTierToday =
    whackDayKeyForDifficulty(difficulty, {
      bonusWhackEasyDayKey: bonusWhackEasy,
      bonusWhackMediumDayKey: bonusWhackMedium,
      bonusWhackHardDayKey: bonusWhackHard,
    }) === today;

  useEffect(() => {
    if (phase === "pick") {
      roundConfigRef.current = WHACK_LEVEL_CONFIG[difficulty];
      setTimeLeftSec(WHACK_LEVEL_CONFIG[difficulty].roundSeconds);
    }
  }, [difficulty, phase]);

  const endRoundVisual = useCallback(
    (finalScore: number) => {
      clearAllTimers();
      spawnGenerationRef.current += 1;
      setPhase("ended");
      setActiveHole(null);

      const level = difficultyRef.current;
      const c = roundConfigRef.current;
      const qualifies = finalScore >= c.threshold;
      const s = useVendorLeadStore.getState();
      const dayKey = calendarDayKey();
      const tierClaimed = whackDayKeyForDifficulty(level, s) === dayKey;

      if (!qualifies) {
        setLastQualified(false);
        setSummary(`${finalScore}/${c.threshold}`);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }

      setLastQualified(true);
      setWinBurstKey((k) => k + 1);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!tierClaimed) {
        const res = tryAwardWhackBonus(level);
        if (res.ok) {
          setSummary(`Goal met · +${c.credits} credits`);
          Alert.alert("Whack", `+${c.credits} credits (${c.label})`);
        } else if (res.reason === "already_claimed_today") {
          setSummary("Goal met · bonus claimed earlier");
          Alert.alert("Whack", `${c.label} · already claimed`);
        }
      } else {
        setSummary(`Goal met · ${c.credits} cr (daily ✓)`);
        Alert.alert("Whack", `${c.label} · daily ✓ practise`);
      }
    },
    [clearAllTimers, tryAwardWhackBonus],
  );

  const scheduleSpawnChain = useCallback((gen: number) => {
    const cfgNow = roundConfigRef.current;

    const t = setTimeout(() => {
      if (spawnGenerationRef.current !== gen) return;

      const idx = Math.floor(Math.random() * 9);

      setActiveHole((cur) => {
        return cur === idx ? (idx + 1) % 9 : idx;
      });

      const hideId = setTimeout(() => {
        if (spawnGenerationRef.current !== gen) return;
        setActiveHole(null);
      }, cfgNow.moleVisibleMs);
      timeoutsRef.current.push(hideId);

      const nextId = setTimeout(
        () => scheduleSpawnChain(gen),
        cfgNow.moleVisibleMs + cfgNow.spawnPauseMs,
      );
      timeoutsRef.current.push(nextId);
    }, cfgNow.spawnPauseMs);
    timeoutsRef.current.push(t);
  }, []);

  const beginPlayingPhase = useCallback(() => {
    clearAllTimers();
    spawnGenerationRef.current += 1;
    const gen = spawnGenerationRef.current;

    roundConfigRef.current = WHACK_LEVEL_CONFIG[difficultyRef.current];

    const c = roundConfigRef.current;
    setPhase("playing");
    setTimeLeftSec(c.roundSeconds);
    setScore(0);
    scoreRef.current = 0;

    scheduleSpawnChain(gen);

    const intervalId = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          intervalsRef.current = intervalsRef.current.filter((x) => x !== intervalId);
          endRoundVisual(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    intervalsRef.current.push(intervalId);
  }, [clearAllTimers, endRoundVisual, scheduleSpawnChain]);

  const runCountdown = useCallback(() => {
    clearAllTimers();
    setPhase("countdown");
    setCountTap(3);
    setSummary(null);

    timeoutsRef.current.push(setTimeout(() => setCountTap(2), 700));
    timeoutsRef.current.push(setTimeout(() => setCountTap(1), 1400));
    timeoutsRef.current.push(setTimeout(beginPlayingPhase, 2200));
  }, [beginPlayingPhase, clearAllTimers]);

  const startAfterPick = () => {
    if (phase !== "pick") return;
    difficultyRef.current = difficulty;
    roundConfigRef.current = WHACK_LEVEL_CONFIG[difficulty];
    void Haptics.selectionAsync().catch(() => {});
    runCountdown();
  };

  const onHolePress = (index: number) => {
    if (phase !== "playing") return;
    if (activeHole !== index) {
      void Haptics.selectionAsync().catch(() => {});
      return;
    }

    setScore((prev) => {
      const next = prev + 1;
      scoreRef.current = next;
      return next;
    });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setActiveHole(null);
  };

  const subtitle = claimedThisTierToday
    ? `${cfg.label} · ${cfg.threshold}+ / ${cfg.roundSeconds}s · practise · ${credits} cr`
    : `${cfg.label} · ${cfg.threshold}+ · ${cfg.roundSeconds}s · +${cfg.credits}/day · ${credits} cr`;

  const countdownLabel = useMemo(() => {
    if (phase === "pick") return "—";
    if (phase === "countdown") return countTap <= 0 ? "Go!" : `${countTap}`;
    if (phase === "playing") return `${Math.max(0, timeLeftSec)}s`;
    return `Done · ${score}`;
  }, [phase, countTap, timeLeftSec, score]);

  const resetToPick = () => {
    clearAllTimers();
    spawnGenerationRef.current += 1;
    const c = WHACK_LEVEL_CONFIG[difficulty];
    setPhase("pick");
    setScore(0);
    scoreRef.current = 0;
    setActiveHole(null);
    setSummary(null);
    setLastQualified(false);
    setTimeLeftSec(c.roundSeconds);
    void Haptics.selectionAsync().catch(() => {});
  };

  return (
    <Screen className="bg-[#eef2fb]">
      <View className="flex-1 px-5 pb-10 pt-4">
        <LinearGradient
          colors={["#065f46", "#059669", "#14b8a6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[26px]"
          style={
            Platform.OS === "ios"
              ? {
                  shadowColor: "#022c22",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.35,
                  shadowRadius: 20,
                }
              : { elevation: 6 }
          }
        >
          <LinearGradient
            colors={["#ffffff", "#f4fffb"]}
            className="m-px rounded-[25px] p-6"
          >
            <Text className="mt-2 text-[26px] font-black tracking-tight text-neutral-950">
              Whack-a-mole
            </Text>
            <Text className="mt-2 text-[12px] font-semibold leading-5 text-neutral-600">
              {subtitle}
            </Text>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
                <Text className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-400">
                  Timer
                </Text>
                <Text className="mt-1 text-[20px] font-black text-accent">
                  {countdownLabel}
                </Text>
              </View>

              <View className="flex-1 rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
                <Text className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-400">
                  Hits
                </Text>
                <Text className="mt-1 text-[20px] font-black text-neutral-950">
                  {score}
                  <Text className="text-[12px] font-bold text-neutral-500">
                    {" "}
                    · {cfg.threshold}
                  </Text>
                </Text>
              </View>
            </View>
          </LinearGradient>
        </LinearGradient>

        {phase === "pick" ? (
          <View className="mt-5 gap-2">
            <Text className="px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-400">
              Difficulty · pick then start
            </Text>
            <View style={{ gap: 8 }}>
              {LEVEL_ORDER.map((tier) => {
                const tierCfg = WHACK_LEVEL_CONFIG[tier];
                const active = tier === difficulty;
                return (
                  <Pressable
                    key={tier}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      setDifficulty(tier);
                    }}
                    className={`flex-row items-center justify-between rounded-2xl border-2 px-4 py-3 ${
                      active
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-neutral-100 bg-white"
                    }`}
                  >
                    <View>
                      <Text className="text-[16px] font-extrabold text-neutral-900">
                        {tierCfg.label}
                      </Text>
                      <Text className="mt-1 text-[12px] font-semibold text-neutral-600">
                        {tierCfg.threshold}+ taps · {tierCfg.roundSeconds}s
                      </Text>
                    </View>
                    <View className="rounded-full bg-brand-goldSoft px-3 py-1.5">
                      <Text className="text-[12px] font-extrabold text-brand-goldDeep">
                        +{tierCfg.credits}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View
          className={`relative overflow-hidden rounded-[26px] border border-white bg-white p-6 ${phase === "pick" ? "mt-5" : "mt-7"}`}
          style={
            Platform.OS === "ios"
              ? {
                  shadowColor: "#005f40",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                }
              : { elevation: 3 }
          }
        >
          <View style={{ gap: 10 }}>
            {[0, 1, 2].map((row) => (
              <View
                key={`r-${row}`}
                style={{ gap: 10 }}
                className="flex-row justify-center"
              >
                {[0, 1, 2].map((col) => {
                  const idx = row * 3 + col;
                  const live = phase === "playing" && activeHole === idx;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Patch ${idx + 1}`}
                      key={idx}
                      disabled={phase !== "playing"}
                      onPress={() => onHolePress(idx)}
                      className={`h-[82px] w-[82px] items-center justify-center rounded-[26px] border-4 border-b-[14px] ${
                        live
                          ? "border-emerald-900/40 bg-emerald-500"
                          : "border-emerald-900/55 bg-emerald-800"
                      } ${phase !== "playing" ? "opacity-75" : ""}`}
                    >
                      {live ? (
                        <LinearGradient
                          colors={["#ecfdf5", "#bbf7d0"]}
                          className="h-[68px] w-[68px] items-center justify-center rounded-[22px]"
                        >
                          <Text className="-mt-[2px]" style={{ fontSize: 42 }}>
                            🐹
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View className="h-[62px] w-[62px] rounded-[22px] bg-emerald-950/85" />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <MiniGameWinOverlay
            show={phase === "ended" && lastQualified}
            burstKey={winBurstKey}
            tone="emerald"
            subline={`+${WHACK_LEVEL_CONFIG[difficultyRef.current].credits} credits`}
          />
        </View>

        <View className="mt-7">
          {phase === "pick" ? (
            <LinearGradient
              colors={["#059669", "#047857"]}
              style={
                Platform.OS === "ios"
                  ? {
                      shadowColor: "#047857",
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.35,
                      shadowRadius: 14,
                    }
                  : { elevation: 4 }
              }
              className="overflow-hidden rounded-full"
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start Whack round with selected difficulty"
                onPress={startAfterPick}
                className="flex-row items-center justify-center gap-2 px-12 py-4 active:opacity-90"
              >
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text className="text-[16px] font-extrabold text-white">
                  Start
                </Text>
              </Pressable>
            </LinearGradient>
          ) : null}

          {phase === "ended" ? (
            <View className="gap-4">
              {summary ? (
                <View className="rounded-3xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <Text className="text-center text-[14px] font-bold leading-6 text-neutral-800">
                    {summary}
                  </Text>
                </View>
              ) : null}
              <LinearGradient
                colors={["#059669", "#047857"]}
                className="overflow-hidden rounded-full"
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change difficulty or play again"
                  onPress={resetToPick}
                  className="py-4 active:opacity-90"
                >
                  <Text className="text-center text-[16px] font-extrabold text-white">
                    Pick level & play
                  </Text>
                </Pressable>
              </LinearGradient>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
