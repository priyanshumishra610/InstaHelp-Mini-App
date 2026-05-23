import { AUTH_ACCENT_TEAL, AUTH_FONT } from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const STATS = [
  { icon: "checkmark-circle" as const, text: "10,000+ bookings completed" },
  { icon: "people" as const, text: "Trusted by users across India" },
  { icon: "flash" as const, text: "Instant local help" },
];

export function AuthLiveStats() {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const liveDot = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.7 + (pulse.value - 1) * 2,
  }));

  return (
    <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.wrap}>
      <View style={styles.liveRow}>
        <Animated.View style={[styles.liveDot, liveDot]} />
        <Text style={[styles.liveLabel, { fontFamily: AUTH_FONT.semibold }]}>
          Live in your city
        </Text>
      </View>
      {STATS.map((item, i) => (
        <Animated.View
          key={item.text}
          entering={FadeIn.duration(400).delay(280 + i * 80)}
          style={styles.statRow}
        >
          <Ionicons name={item.icon} size={14} color={AUTH_ACCENT_TEAL} />
          <Text style={[styles.statText, { fontFamily: AUTH_FONT.medium }]}>
            {item.text}
          </Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 22,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    gap: 8,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AUTH_ACCENT_TEAL,
  },
  liveLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
    letterSpacing: 0.15,
  },
});
