import { AUTH_ACCENT_TEAL, AUTH_PRIMARY, AUTH_PRIMARY_LIGHT } from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
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
  gradient: readonly [string, string];
  size: number;
  style: object;
  delay?: number;
  rotateAmp?: number;
};

const ICONS: FloatIcon[] = [
  {
    name: "location",
    color: "#fff",
    gradient: [AUTH_PRIMARY_LIGHT, AUTH_PRIMARY],
    size: 22,
    style: { top: "10%", left: "5%" },
    delay: 0,
  },
  {
    name: "construct",
    color: AUTH_PRIMARY,
    gradient: ["#fff", "#e2e8f0"],
    size: 24,
    style: { top: "7%", right: "10%" },
    delay: 350,
    rotateAmp: 10,
  },
  {
    name: "water-outline",
    color: "#0ea5e9",
    gradient: ["#fff", "#f0f9ff"],
    size: 20,
    style: { top: "26%", left: "2%" },
    delay: 180,
  },
  {
    name: "cube",
    color: AUTH_PRIMARY,
    gradient: [AUTH_ACCENT_TEAL, "#2dd4bf"],
    size: 21,
    style: { bottom: "26%", right: "5%" },
    delay: 520,
  },
  {
    name: "flash",
    color: "#FBBF24",
    gradient: ["#fff", "#fef3c7"],
    size: 19,
    style: { bottom: "30%", left: "3%" },
    delay: 240,
  },
  {
    name: "sparkles",
    color: "#fff",
    gradient: ["#a78bfa", AUTH_PRIMARY],
    size: 17,
    style: { top: "40%", right: "1%" },
    delay: 400,
  },
  {
    name: "notifications",
    color: AUTH_PRIMARY,
    gradient: ["#fff", "#f8fafc"],
    size: 16,
    style: { top: "52%", left: "1%" },
    delay: 600,
  },
  {
    name: "checkmark-circle",
    color: "#fff",
    gradient: ["#22c55e", "#16a34a"],
    size: 18,
    style: { bottom: "18%", right: "12%" },
    delay: 700,
  },
];

function FloatingIcon({ icon }: { icon: FloatIcon }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      icon.delay ?? 0,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    translateX.value = withDelay(
      (icon.delay ?? 0) + 200,
      withRepeat(
        withSequence(
          withTiming(6, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
          withTiming(-8, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      icon.delay ?? 0,
      withRepeat(
        withSequence(
          withTiming(-(icon.rotateAmp ?? 6), {
            duration: 3400,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(icon.rotateAmp ?? 6, {
            duration: 3400,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );
  }, [icon.delay, icon.rotateAmp, rotate, translateX, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const bubble = icon.size + 30;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.floatItem, icon.style, animStyle]}
    >
      <View
        style={[
          styles.glow,
          {
            width: bubble + 16,
            height: bubble + 16,
            borderRadius: (bubble + 16) / 2,
          },
        ]}
      />
      <LinearGradient
        colors={icon.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconBubble,
          {
            width: bubble,
            height: bubble,
            borderRadius: bubble / 2,
          },
        ]}
      >
        {Platform.OS !== "web" ? (
          <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
        ) : null}
        <Ionicons name={icon.name} size={icon.size} color={icon.color} />
      </LinearGradient>
    </Animated.View>
  );
}

export function FloatingServiceObjects() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {ICONS.map((icon) => (
        <FloatingIcon key={`${icon.name}-${String(icon.style)}`} icon={icon} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  floatItem: {
    position: "absolute",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    position: "absolute",
    alignSelf: "center",
    top: -8,
    left: -8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconBubble: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
});
