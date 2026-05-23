import { AUTH_ACCENT_TEAL, AUTH_CARD_RADIUS_LG, AUTH_PRIMARY } from "@/constants/authPremium";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  accentEdge?: boolean;
  glowPulse?: boolean;
}>;

export function GlassAuthCard({
  children,
  style,
  elevated,
  accentEdge,
  glowPulse,
}: Props) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!glowPulse && !elevated) return;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [breathe, elevated, glowPulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + breathe.value * 0.35,
    transform: [{ scale: 1 + breathe.value * 0.02 }],
  }));

  return (
    <View style={[styles.outer, elevated && styles.outerElevated, style]}>
      {elevated ? (
        <Animated.View pointerEvents="none" style={[styles.glowHalo, glowStyle]} />
      ) : null}
      <View style={[styles.card, elevated && styles.cardElevated]}>
        {Platform.OS !== "web" ? (
          <BlurView
            intensity={elevated ? 72 : 58}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {accentEdge ? (
          <LinearGradient
            pointerEvents="none"
            colors={[AUTH_ACCENT_TEAL, AUTH_PRIMARY, "transparent"]}
            locations={[0, 0.4, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />
        ) : null}
        <LinearGradient
          pointerEvents="none"
          colors={
            elevated
              ? ["rgba(255,255,255,0.97)", "rgba(255,255,255,0.9)"]
              : ["rgba(255,255,255,0.92)", "rgba(255,255,255,0.86)"]
          }
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.shine} />
        <View pointerEvents="none" style={styles.innerRim} />
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: AUTH_CARD_RADIUS_LG,
  },
  outerElevated: {
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 22,
  },
  glowHalo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AUTH_CARD_RADIUS_LG + 8,
    margin: -8,
    backgroundColor: "rgba(79,209,197,0.22)",
  },
  card: {
    borderRadius: AUTH_CARD_RADIUS_LG,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.75)",
    minHeight: 100,
    shadowColor: "#061229",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 12,
  },
  cardElevated: {
    shadowOpacity: 0.34,
    shadowRadius: 38,
    elevation: 18,
  },
  content: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 2,
    opacity: 0.9,
  },
  shine: {
    position: "absolute",
    top: -52,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(37,99,235,0.08)",
  },
  innerRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AUTH_CARD_RADIUS_LG,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
});
