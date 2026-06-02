import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import {
  ARCADE_DAILY_BONUS_CREDITS_TOTAL,
  BONUS_GAME_HANGMAN_CREDITS,
  BONUS_GAME_TIC_TAC_TOE_CREDITS,
  BONUS_WHACK_EASY_CREDITS,
  BONUS_WHACK_HARD_CREDITS,
  BONUS_WHACK_MEDIUM_CREDITS,
} from "@/constants/vendorMarketplace";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

type ClassicGame = {
  key: string;
  title: string;
  credits: string;
  href: "/(tabs)/vendors/arcade/grid" | "/(tabs)/vendors/arcade/hangman" | "/(tabs)/vendors/arcade/whack";
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
};

const CLASSICS: ClassicGame[] = [
  {
    key: "grid",
    title: "Insta Grid",
    credits: `+${BONUS_GAME_TIC_TAC_TOE_CREDITS}/day`,
    href: "/(tabs)/vendors/arcade/grid",
    icon: "grid-outline",
    gradient: ["#7C3AED", "#7C3AED"],
  },
  {
    key: "hangman",
    title: "Hangman",
    credits: `+${BONUS_GAME_HANGMAN_CREDITS}/day`,
    href: "/(tabs)/vendors/arcade/hangman",
    icon: "book-outline",
    gradient: ["#7c3aed", "#9333ea"],
  },
  {
    key: "whack",
    title: "Whack-a-mole",
    credits: `+${BONUS_WHACK_EASY_CREDITS}/+${BONUS_WHACK_MEDIUM_CREDITS}/+${BONUS_WHACK_HARD_CREDITS}`,
    href: "/(tabs)/vendors/arcade/whack",
    icon: "flash-outline",
    gradient: ["#059669", "#14b8a6"],
  },
];

export function InstaClassicsRow() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>InstaHelp Classics</Text>
        <Text style={styles.subtitle}>
          Native arcade · up to {ARCADE_DAILY_BONUS_CREDITS_TOTAL} credits/day
        </Text>
      </View>

      <View style={styles.list}>
        {CLASSICS.map((g) => (
          <PremiumPressable
            key={g.key}
            accessibilityRole="button"
            accessibilityLabel={`Open ${g.title}`}
            onPress={() => router.push(g.href)}
            style={styles.card}
          >
            <LinearGradient colors={[...g.gradient]} style={styles.cardGradient}>
              <Ionicons name={g.icon} size={22} color="#fff" />
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{g.title}</Text>
                <Text style={styles.cardCredits}>{g.credits}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </PremiumPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#f1f5f9",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(148,163,184,0.95)",
  },
  list: {
    gap: 10,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  cardCredits: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
});
