import { Screen } from "@/components/ui/Screen";
import { MiniGameWinOverlay } from "@/components/vendors/MiniGameWinOverlay";
import { BONUS_GAME_HANGMAN_CREDITS } from "@/constants/vendorMarketplace";
import { useGameOpenCreditOnMount } from "@/hooks/useGameOpenCredit";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { calendarDayKey } from "@/utils/calendarDay";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

/** InstaHelp-flavoured words (A–Z capitals); keep length approachable. */
const HANGMAN_LEXICON = [
  "VENDOR",
  "EXPLORE",
  "CAPTURE",
  "CREDITS",
  "REVEAL",
  "CONTACT",
  "SEARCH",
  "FILTER",
  "NEARBY",
  "SERVICE",
  "PLUMBER",
  "SPA",
  "SALON",
  "PICKUP",
  "DELIVERY",
  "BOOKING",
  "RATING",
  "TRUSTED",
  "LOCAL",
  "ARCADE",
  "BALANCE",
  "SUPPORT",
  "INSTANT",
  "REQUEST",
  "PREMIUM",
  "LISTING",
  "KITCHEN",
  "HOMECARE",
  "GARDENER",
].map((w) => w.toUpperCase());

const MAX_WRONG = 6;

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode("A".charCodeAt(0) + i),
);

function randomWord(seed?: number): string {
  let x = typeof seed === "number" ? seed : Math.floor(Math.random() * 1e9);
  x = Math.abs(x) % HANGMAN_LEXICON.length;
  return HANGMAN_LEXICON[x];
}

export function HangmanGameScreen() {
  useGameOpenCreditOnMount("Hangman");
  const tryAwardHangmanBonus = useVendorLeadStore((s) => s.tryAwardHangmanBonus);
  const credits = useVendorLeadStore((s) => s.credits);
  const claimedDayKey = useVendorLeadStore((s) => s.bonusHangmanAwardDayKey);

  const today = calendarDayKey();
  const claimedToday = claimedDayKey === today;

  const [word, setWord] = useState(() => randomWord());
  const [guessed, setGuessed] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [tick, setTick] = useState(0); // reroll helper
  const [winBurstKey, setWinBurstKey] = useState(0);

  useEffect(() => {
    if (status === "won") setWinBurstKey((k) => k + 1);
  }, [status]);

  const wrongCount = useMemo(() => {
    const wrong = [...guessed].filter((ch) => !word.includes(ch));
    return wrong.length;
  }, [guessed, word]);

  const wrongLetters = useMemo(() => {
    const w = [...guessed].filter((ch) => !word.includes(ch));
    return w.sort().join(" ");
  }, [guessed, word]);

  const newRound = useCallback(() => {
    setWord(randomWord(Date.now()));
    setGuessed(new Set());
    setStatus("playing");
    setTick((n) => n + 1);
    void Haptics.selectionAsync().catch(() => {});
  }, []);

  const onLetterPress = (letter: string) => {
    if (status !== "playing") return;
    if (guessed.has(letter)) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const nextGuess = new Set(guessed);
    nextGuess.add(letter);

    const inWord = word.includes(letter);

    let nextWrong = wrongCount + (inWord ? 0 : 1);

    if (!inWord && nextWrong >= MAX_WRONG) {
      setGuessed(nextGuess);
      setStatus("lost");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const won = [...word].every((c) => nextGuess.has(c));
    setGuessed(nextGuess);

    if (won) {
      setStatus("won");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!claimedToday) {
        const res = tryAwardHangmanBonus();
        if (res.ok) {
          Alert.alert("Hangman", `+${BONUS_GAME_HANGMAN_CREDITS} credits`);
        } else if (res.reason === "already_claimed_today") {
          Alert.alert("Hangman", "Bonus already claimed · nice solve.");
        }
      } else {
        Alert.alert("Hangman", "Daily prize ✓ · practise run.");
      }
    }
  };

  const subtitle = claimedToday
    ? `${MAX_WRONG} misses · practise`
    : `${MAX_WRONG} misses · win +${BONUS_GAME_HANGMAN_CREDITS} / day`;

  return (
    <Screen className="bg-[#FFFFFF]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#0C0A09", "#171717", "#292524"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="overflow-hidden rounded-[24px] p-px"
          style={
            Platform.OS === "ios"
              ? {
                  shadowColor: "#581c87",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.25,
                  shadowRadius: 20,
                }
              : { elevation: 5 }
          }
        >
          <View className="rounded-[23px] bg-white px-4 py-4">
            <Text className="text-[22px] font-black text-neutral-950">
              Hangman
            </Text>
            <Text className="mt-1 text-[12px] font-semibold text-neutral-500">
              {subtitle}
            </Text>

            <View className="mt-3 flex-row flex-wrap gap-2">
              <View className="flex-row items-center gap-1.5 rounded-xl border border-neutral-100 bg-neutral-50 px-2.5 py-1.5">
                <Ionicons name="wallet-outline" size={16} color="#171717" />
                <Text className="text-[12px] font-extrabold text-neutral-800">
                  {credits} cr
                </Text>
              </View>
              <View
                className={`flex-row items-center gap-1.5 rounded-xl px-2.5 py-1.5 ${claimedToday ? "border border-emerald-100 bg-emerald-50" : "border border-violet-100 bg-violet-50/80"}`}
              >
                <Ionicons
                  name={claimedToday ? "checkmark-done" : "gift-outline"}
                  size={16}
                  color={claimedToday ? "#059669" : "#171717"}
                />
                <Text
                  className={`text-[11px] font-extrabold ${claimedToday ? "text-emerald-800" : "text-violet-900"}`}
                >
                  {claimedToday ? "Daily ✓" : `+${BONUS_GAME_HANGMAN_CREDITS}`}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View className="relative mt-4 rounded-[22px] border border-neutral-100 bg-white px-3 py-4">
          <View className="flex-row flex-wrap justify-center gap-2 pb-4">
            {word.split("").map((letter, idx) => {
              const reveal = guessed.has(letter);
              const char = reveal ? letter : "—";
              return (
                <View
                  key={`${tick}-${idx}`}
                  style={{ width: 28 }}
                  className={`items-center pb-2 ${reveal ? "border-b-[3px] border-violet-600" : "border-b-[3px] border-neutral-200"}`}
                >
                  <Text className="text-[22px] font-black tracking-tight text-neutral-900">
                    {char}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2">
            <Text className="text-center text-[13px] font-black text-neutral-900">
              Misses {wrongCount}/{MAX_WRONG}
              {wrongLetters ? (
                <Text className="font-semibold text-neutral-500">
                  {" "}
                  · {wrongLetters}
                </Text>
              ) : null}
            </Text>
          </View>

          <MiniGameWinOverlay
            show={status === "won"}
            burstKey={winBurstKey}
            tone="violet"
            subline={`+${BONUS_GAME_HANGMAN_CREDITS} credits`}
          />
        </View>

        <Text className="mx-1 mt-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-neutral-400">
          Letters
        </Text>

        <View className="mt-3 flex-row flex-wrap justify-center gap-2">
          {ALPHABET.map((L) => {
            const pressed = guessed.has(L);
            const disabled = pressed || status !== "playing";

            let bg =
              pressed && word.includes(L)
                ? "border-emerald-200 bg-emerald-50"
                : pressed
                  ? "border-neutral-200 bg-neutral-100"
                  : "border-violet-100 bg-white active:bg-violet-50";

            return (
              <Pressable
                key={`${tick}-${L}`}
                onPress={() => onLetterPress(L)}
                disabled={disabled}
                className={`h-11 w-11 items-center justify-center rounded-2xl border ${bg}`}
              >
                <Text
                  className={`text-[17px] font-black ${pressed ? (word.includes(L) ? "text-emerald-700" : "text-neutral-400") : "text-neutral-900"}`}
                >
                  {L}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <LinearGradient
          colors={["#171717", "#581c87"]}
          className="mt-6 overflow-hidden rounded-full"
          style={
            Platform.OS === "ios"
              ? {
                  shadowColor: "#581c87",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                }
              : { elevation: 4 }
          }
        >
          <Pressable onPress={newRound} className="py-4 active:opacity-90">
            <Text className="text-center text-[16px] font-extrabold text-white">
              {status === "playing" ? "New puzzle" : "Play again"}
            </Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>
    </Screen>
  );
}
