import { Screen } from "@/components/ui/Screen";
import {
  ARCADE_DAILY_BONUS_CREDITS_TOTAL,
  ARCADE_DAILY_PRIZE_SLOTS,
  BONUS_GAME_HANGMAN_CREDITS,
  BONUS_GAME_TIC_TAC_TOE_CREDITS,
  BONUS_WHACK_EASY_CREDITS,
  BONUS_WHACK_HARD_CREDITS,
  BONUS_WHACK_MEDIUM_CREDITS,
} from "@/constants/vendorMarketplace";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { calendarDayKey } from "@/utils/calendarDay";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

const CARD_IOS = {
  shadowColor: "#004aad",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 18,
};

type GameTile = {
  key: string;
  title: string;
  subtitle: string;
  href: "/(tabs)/vendors/earn-game/grid" | "/(tabs)/vendors/earn-game/hangman" | "/(tabs)/vendors/earn-game/whack";
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  accentIcon: keyof typeof Ionicons.glyphMap;
  creditsLabel: string;
};

const GAMES: GameTile[] = [
  {
    key: "grid",
    title: "Insta Grid",
    subtitle: "Classic tic-tac-toe vs Insta-bot.",
    href: "/(tabs)/vendors/earn-game/grid",
    icon: "grid-outline",
    gradient: ["#004aad", "#2563eb"] as const,
    accentIcon: "medal-outline",
    creditsLabel: `+${BONUS_GAME_TIC_TAC_TOE_CREDITS} / day`,
  },
  {
    key: "hangman",
    title: "Vendor Hangman",
    subtitle: "Guess the word — six misses and it’s curtains.",
    href: "/(tabs)/vendors/earn-game/hangman",
    icon: "book-outline",
    gradient: ["#7c3aed", "#9333ea"] as const,
    accentIcon: "help-buoy-outline",
    creditsLabel: `+${BONUS_GAME_HANGMAN_CREDITS} / day`,
  },
  {
    key: "whack",
    title: "Whack-a-mole",
    subtitle: "Three levels — faster moles on Hard.",
    href: "/(tabs)/vendors/earn-game/whack",
    icon: "flash-outline",
    gradient: ["#059669", "#14b8a6"] as const,
    accentIcon: "pulse-outline",
    creditsLabel: `+${BONUS_WHACK_EASY_CREDITS} / +${BONUS_WHACK_MEDIUM_CREDITS} / +${BONUS_WHACK_HARD_CREDITS} / day`,
  },
];

export function ArcadeHubScreen() {
  const router = useRouter();
  const credits = useVendorLeadStore((s) => s.credits);
  const bonusGrid = useVendorLeadStore((s) => s.bonusTicTacToeAwardDayKey);
  const bonusHang = useVendorLeadStore((s) => s.bonusHangmanAwardDayKey);
  const bonusWhackE = useVendorLeadStore((s) => s.bonusWhackEasyDayKey);
  const bonusWhackM = useVendorLeadStore((s) => s.bonusWhackMediumDayKey);
  const bonusWhackH = useVendorLeadStore((s) => s.bonusWhackHardDayKey);

  const today = calendarDayKey();
  const bonusesLeftToday = useMemo(() => {
    let n = 0;
    if (bonusGrid !== today) n += 1;
    if (bonusHang !== today) n += 1;
    if (bonusWhackE !== today) n += 1;
    if (bonusWhackM !== today) n += 1;
    if (bonusWhackH !== today) n += 1;
    return n;
  }, [bonusGrid, bonusHang, bonusWhackE, bonusWhackM, bonusWhackH, today]);

  return (
    <Screen className="bg-[#eef2fb]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#dde7fb", "#f0f4fc"]}
          className="mb-6 overflow-hidden rounded-[26px] border border-white p-6"
          style={Platform.OS === "ios" ? CARD_IOS : { elevation: 3 }}
        >
          <View className="flex-row flex-wrap items-center justify-between gap-3">
            <View className="max-w-[70%]">
              <Text className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent-muted">
                Bonus refill
              </Text>
              <Text className="mt-2 text-[22px] font-extrabold text-neutral-950">
                InstaHelp Arcade
              </Text>
              <Text className="mt-2 text-[13px] leading-5 text-neutral-600">
                Wins pay what each card lists (Whack: +5 / +10 / +15).{" "}
                <Text className="font-bold text-neutral-900">
                  Once per prize per calendar day —
                </Text>{" "}
                practise without limit after redeeming or missing the goal.
              </Text>
            </View>
            <View className="items-end">
              <View className="rounded-2xl border border-accent-tint bg-white px-3 py-2">
                <Text className="text-[10px] font-extrabold uppercase tracking-wide text-neutral-500">
                  Balance
                </Text>
                <Text className="text-right text-2xl font-black text-accent">
                  {credits}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-2xl border border-accent/15 bg-accent-soft/50 px-3 py-2.5">
            <Text className="text-[12px] font-semibold text-accent-deep">
              {bonusesLeftToday > 0
                ? `${bonusesLeftToday} of ${ARCADE_DAILY_PRIZE_SLOTS} daily prizes left today · up to ${ARCADE_DAILY_BONUS_CREDITS_TOTAL} credits if you sweep the board.`
                : `All arcade prizes redeemed for today (${today}) — missions reset at midnight.`}
            </Text>
          </View>
        </LinearGradient>

        <Text className="mb-3 px-0.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-neutral-400">
          Pick a game
        </Text>

        <View className="gap-4">
          {GAMES.map((g) => (
            <Pressable
              key={g.key}
              accessibilityRole="button"
              accessibilityLabel={`Open ${g.title}`}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {},
                );
                router.push(g.href);
              }}
              className="overflow-hidden rounded-[22px] border border-white/90 bg-white active:opacity-95"
              style={Platform.OS === "ios" ? CARD_IOS : { elevation: 2 }}
            >
              <View className="flex-row gap-4 p-4">
                <LinearGradient
                  colors={[...g.gradient]}
                  className="h-16 w-16 items-center justify-center rounded-[18px]"
                >
                  <Ionicons name={g.icon} size={30} color="#ffffff" />
                </LinearGradient>
                <View className="flex-1 justify-center">
                  <View className="flex-row items-center gap-2">
                    <Text className="flex-1 text-[17px] font-extrabold text-neutral-900">
                      {g.title}
                    </Text>
                    <View className="flex-row items-center gap-1 rounded-full bg-brand-goldSoft px-2 py-0.5">
                      <Ionicons name={g.accentIcon} size={13} color="#b88a00" />
                      <Text className="text-[11px] font-extrabold text-brand-goldDeep">
                        {g.creditsLabel}
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-1 text-[13px] font-medium leading-5 text-neutral-600">
                    {g.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#cbd5f5" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
