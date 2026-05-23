import { LinearGradient } from "expo-linear-gradient";
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

function GlowOrb({
  color,
  size,
  top,
  left,
  delay,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.92, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 2800 }),
          withTiming(0.22, { duration: 2800 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export function PlayHubBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#070b1a", "#0f172a", "#111827"]}
        style={StyleSheet.absoluteFill}
      />
      <GlowOrb color="#6366f1" size={220} top={-40} left={-60} delay={0} />
      <GlowOrb color="#8b5cf6" size={180} top={120} left={220} delay={400} />
      <GlowOrb color="#06b6d4" size={140} top={380} left={-30} delay={800} />
      <LinearGradient
        colors={["transparent", "rgba(7,11,26,0.85)"]}
        style={[StyleSheet.absoluteFill, { top: "55%" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    shadowColor: "#fff",
    shadowOpacity: 0.15,
    shadowRadius: 40,
  },
});
