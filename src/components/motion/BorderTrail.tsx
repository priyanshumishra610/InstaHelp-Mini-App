import { MotiView } from "moti";
import { type ReactNode, useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ACCENT } from "@/constants/theme";

type Props = {
  children: ReactNode;
  active?: boolean;
  radius?: number;
  /** Trail accent — defaults to brand blue. */
  color?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/**
 * Animated edge highlight — RN port of Motion-Primitives Border Trail.
 * Runs only when active to keep GPU cost low.
 * @see https://motion-primitives.com/docs/border-trail
 */
export function BorderTrail({
  children,
  active = false,
  radius = 999,
  color = ACCENT,
  style,
  className,
}: Props) {
  const spin = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      spin.value = 0;
      return;
    }
    spin.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [active, spin]);

  const trailStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <View style={[{ borderRadius: radius }, style]} className={className}>
      {active ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}
        >
          <Animated.View style={[styles.spinLayer, trailStyle]}>
            <LinearGradient
              colors={[
                "transparent",
                "transparent",
                `${color}8C`,
                color,
                `${color}8C`,
                "transparent",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />
          </Animated.View>
          <View
            style={[
              styles.innerMask,
              { borderRadius: radius - 1.5, backgroundColor: color },
            ]}
          />
        </View>
      ) : null}
      <MotiView
        animate={{
          scale: active ? 1 : 1,
        }}
        style={{ borderRadius: radius, zIndex: 1 }}
      >
        {children}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  spinLayer: {
    position: "absolute",
    width: "180%",
    height: "180%",
    left: "-40%",
    top: "-40%",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  innerMask: {
    ...StyleSheet.absoluteFillObject,
    margin: 1.5,
  },
});
