import { AUTH_ACCENT_TEAL, AUTH_PRIMARY } from "@/constants/authPremium";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function Streak({
  style,
  colors,
  duration,
}: {
  style: object;
  colors: readonly [string, string, ...string[]];
  duration: number;
}) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(40, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: duration * 0.8 }),
        withTiming(0.2, { duration: duration * 0.8 }),
      ),
      -1,
      true,
    );
  }, [duration, opacity, translateX]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: "-18deg" }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, anim]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.streak}
      />
    </Animated.View>
  );
}

export function AuthLightStreaks() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Streak
        style={styles.streakA}
        colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]}
        duration={9000}
      />
      <Streak
        style={styles.streakB}
        colors={["transparent", `${AUTH_ACCENT_TEAL}66`, "transparent"]}
        duration={11000}
      />
      <Streak
        style={styles.streakC}
        colors={["transparent", `${AUTH_PRIMARY}44`, "transparent"]}
        duration={7500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  streak: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  streakA: {
    position: "absolute",
    top: "22%",
    left: "-20%",
    width: "140%",
    height: 3,
  },
  streakB: {
    position: "absolute",
    top: "48%",
    right: "-25%",
    width: "130%",
    height: 2,
  },
  streakC: {
    position: "absolute",
    bottom: "30%",
    left: "-15%",
    width: "120%",
    height: 2,
  },
});
