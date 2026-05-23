import { GamingSparkles } from "@/components/gaming/GamingSparkles";
import { usePlayRewardsStore } from "@/store/playRewardsStore";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function AnimatedCoinBalance({ coins }: { coins: number }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={coinStyle}>
      <LinearGradient
        colors={["#fbbf24", "#f59e0b", "#d97706"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.coinPill}
      >
        <Ionicons name="logo-bitcoin" size={16} color="#1c1917" />
        <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export function PlayHubHeader() {
  const playCoins = usePlayRewardsStore((s) => s.playCoins);
  const streakDays = usePlayRewardsStore((s) => s.streakDays);
  const vendorCredits = useVendorLeadStore((s) => s.credits);

  return (
    <View style={styles.wrap}>
      <GamingSparkles count={10} />
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>INSTAHELP PLAY</Text>
          <Text style={styles.title}>InstaHelp Play</Text>
          <Text style={styles.subtitle}>
            Play games. Earn rewards. Unlock offers.
          </Text>
        </View>
        <View style={styles.badges}>
          <AnimatedCoinBalance coins={playCoins} />
          <BlurView intensity={40} tint="dark" style={styles.rewardBadge}>
            <Ionicons name="flame" size={14} color="#fb923c" />
            <Text style={styles.rewardBadgeText}>{streakDays}d streak</Text>
          </BlurView>
        </View>
      </View>

      <BlurView intensity={28} tint="dark" style={styles.creditsStrip}>
        <Ionicons name="medal-outline" size={18} color="#93c5fd" />
        <Text style={styles.creditsStripText}>
          Arcade credits:{" "}
          <Text style={styles.creditsBold}>{vendorCredits}</Text> · redeem on
          vendor reveals
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    maxWidth: "68%",
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.2,
    color: "rgba(147,197,253,0.85)",
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    color: "rgba(203,213,225,0.9)",
  },
  badges: {
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 4,
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    ...Platform.select({
      ios: {
        shadowColor: "#fbbf24",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  coinText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1c1917",
  },
  rewardBadge: {
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  rewardBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fed7aa",
  },
  creditsStrip: {
    overflow: "hidden",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  creditsStripText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(226,232,240,0.85)",
  },
  creditsBold: {
    fontWeight: "900",
    color: "#93c5fd",
  },
});
