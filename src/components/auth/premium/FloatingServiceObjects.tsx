import { AUTH_ACCENT_TEAL, AUTH_PRIMARY } from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type FloatIcon = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  size: number;
  style: object;
  delay?: number;
};

const ICONS: FloatIcon[] = [
  {
    name: "location",
    color: "#fff",
    bg: AUTH_PRIMARY,
    size: 22,
    style: { top: "12%", left: "6%" },
    delay: 0,
  },
  {
    name: "construct",
    color: AUTH_PRIMARY,
    bg: "rgba(255,255,255,0.95)",
    size: 26,
    style: { top: "8%", right: "14%" },
    delay: 400,
  },
  {
    name: "flash",
    color: "#FBBF24",
    bg: "rgba(255,255,255,0.92)",
    size: 20,
    style: { bottom: "28%", left: "4%" },
    delay: 200,
  },
  {
    name: "cube",
    color: AUTH_PRIMARY,
    bg: AUTH_ACCENT_TEAL,
    size: 22,
    style: { bottom: "22%", right: "6%" },
    delay: 600,
  },
  {
    name: "sparkles",
    color: "#fff",
    bg: "rgba(79,209,197,0.9)",
    size: 18,
    style: { top: "42%", right: "2%" },
    delay: 300,
  },
  {
    name: "notifications",
    color: AUTH_PRIMARY,
    bg: "#fff",
    size: 16,
    style: { top: "55%", left: "2%" },
    delay: 500,
  },
];

function FloatingIcon({ icon }: { icon: FloatIcon }) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      icon.delay ?? 0,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(6, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      icon.delay ?? 0,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, [icon.delay, rotate, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.floatItem, icon.style, animStyle]}
    >
      <View
        style={[
          styles.iconBubble,
          {
            backgroundColor: icon.bg,
            width: icon.size + 28,
            height: icon.size + 28,
            borderRadius: (icon.size + 28) / 2,
          },
        ]}
      >
        <Ionicons name={icon.name} size={icon.size} color={icon.color} />
      </View>
    </Animated.View>
  );
}

export function FloatingServiceObjects() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {ICONS.map((icon) => (
        <FloatingIcon key={icon.name} icon={icon} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  floatItem: {
    position: "absolute",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  iconBubble: {
    alignItems: "center",
    justifyContent: "center",
  },
});
