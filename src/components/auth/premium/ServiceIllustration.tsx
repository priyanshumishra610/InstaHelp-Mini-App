import { AUTH_ACCENT_TEAL, AUTH_PRIMARY, AUTH_FONT } from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const BADGES: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  top: number;
  left?: number;
  right?: number;
}[] = [
  { icon: "flash", label: "Electric", top: 2, left: 4 },
  { icon: "water-outline", label: "Plumber", top: 34, right: 0 },
  { icon: "car", label: "Delivery", top: 64, left: 16 },
  { icon: "sparkles", label: "Beauty", top: 48, left: 56 },
  { icon: "home", label: "Home", top: 78, right: 28 },
];

export function ServiceIllustration() {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const heroAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.hero, heroAnim]}>
        <LinearGradient
          colors={[`${AUTH_ACCENT_TEAL}55`, `${AUTH_PRIMARY}22`]}
          style={styles.heroGradient}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={AUTH_PRIMARY} />
          </View>
          <View style={styles.helperRing}>
            <Ionicons name="headset" size={17} color="#fff" />
          </View>
          <View style={styles.proBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
          </View>
        </LinearGradient>
      </Animated.View>
      {BADGES.map((b) => (
        <View
          key={b.label}
          style={[
            styles.badge,
            { top: b.top, left: b.left, right: b.right },
          ]}
        >
          <Ionicons name={b.icon} size={11} color={AUTH_PRIMARY} />
          <Text style={[styles.badgeText, { fontFamily: AUTH_FONT.semibold }]}>
            {b.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 118,
    marginVertical: 10,
    position: "relative",
  },
  hero: {
    alignSelf: "center",
  },
  heroGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(37,99,235,0.18)",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  helperRing: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AUTH_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  proBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.14)",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeText: {
    fontSize: 9,
    color: "#4C1D95",
  },
});
