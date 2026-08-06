import { GamingAdBanner } from "@/components/gaming/hub/GamingAdBanner";
import { GamingHubBackground } from "@/components/gaming/hub/GamingHubBackground";
import { InstantPlaysSection } from "@/components/gaming/hub/InstantPlaysSection";
import { MyGamesSection } from "@/components/gaming/hub/MyGamesSection";
import { RecommendedSection } from "@/components/gaming/hub/RecommendedSection";
import {
  FEATURED_AD_GAME,
  MY_GAMES,
  RECOMMENDED_GAMES,
  TOP_INSTANT_PLAYS,
} from "@/constants/gamingHub";
import type { InstaGame } from "@/constants/instaGames";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ArcadeHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const credits = useVendorLeadStore((s) => s.credits);

  const openGame = useCallback(
    (game: InstaGame) => {
      router.push(game.route);
    },
    [router],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GamingHubBackground />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 4,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.topBar,
            {
              paddingLeft: Math.max(insets.left, 12),
              paddingRight: Math.max(insets.right, 12),
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          >
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </Pressable>

          <Text style={styles.topTitle} numberOfLines={1}>
            InstaHelp Games
          </Text>

          <View
            style={styles.creditsPill}
            accessibilityLabel={`${credits} vendor credits`}
          >
            <LinearGradient
              colors={["#004aad", "#0066FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.creditsGradient}
            >
              <Ionicons name="diamond-outline" size={16} color="#ffd500" />
              <Text style={styles.creditsValue}>{credits}</Text>
              <Text style={styles.creditsLabel}>credits</Text>
            </LinearGradient>
          </View>
        </View>

        <MyGamesSection games={MY_GAMES} onPlay={openGame} />
        <RecommendedSection games={RECOMMENDED_GAMES} onPlay={openGame} />
        <GamingAdBanner game={FEATURED_AD_GAME} onPlay={openGame} />
        <InstantPlaysSection games={TOP_INSTANT_PLAYS} onPlay={openGame} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a0b2e",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: -0.2,
  },
  creditsPill: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  creditsGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  creditsValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
  creditsLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.88)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  backBtnPressed: {
    opacity: 0.88,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  scroll: {
    flex: 1,
  },
});
