import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type PinProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  size: "sm" | "lg";
  delay?: number;
  baseRotate?: number;
  baseTranslateY?: number;
  floatRange?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MapPin({
  icon,
  size,
  delay = 0,
  baseRotate = 0,
  baseTranslateY = 0,
  floatRange = 10,
}: PinProps) {
  const isLarge = size === "lg";
  const w = isLarge ? 88 : 64;
  const h = isLarge ? 108 : 80;

  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    const duration = isLarge ? 2800 : 3200;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-floatRange, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(floatRange * 0.65, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );

    rotate.value = withDelay(
      delay + 120,
      withRepeat(
        withSequence(
          withTiming(isLarge ? 2.5 : 4, {
            duration: duration + 400,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(isLarge ? -2.5 : -4, {
            duration: duration + 400,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, floatRange, isLarge, rotate, translateY]);

  const pinAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: baseTranslateY + translateY.value },
      { rotate: `${baseRotate + rotate.value}deg` },
      { scale: pressScale.value },
    ],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Service pin ${icon}`}
      onPressIn={() => {
        pressScale.value = withSpring(0.9, { damping: 14, stiffness: 360 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 12, stiffness: 280 });
      }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        pressScale.value = withSequence(
          withSpring(1.08, { damping: 10, stiffness: 320 }),
          withSpring(1, { damping: 12, stiffness: 260 }),
        );
      }}
      style={[styles.pinWrap, pinAnim]}
    >
      <LinearGradient
        colors={["#7C3AED", "#5B21B6", "#4C1D95"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[
          styles.pin,
          {
            width: w,
            height: h,
            borderTopLeftRadius: w / 2,
            borderTopRightRadius: w / 2,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          },
        ]}
      >
        <View style={[styles.pinInner, isLarge && styles.pinInnerLg]}>
          <MaterialCommunityIcons name={icon} size={isLarge ? 28 : 22} color="#fff" />
        </View>
      </LinearGradient>
      <View style={[styles.pinTip, { width: w * 0.22, marginTop: -2 }]} />
    </AnimatedPressable>
  );
}

/** Service marks with float motion and tap bounce */
export function LoginHeroVisual() {
  return (
    <View style={styles.stage}>
      <View style={styles.pins}>
        <MapPin
          icon="home-outline"
          size="sm"
          delay={0}
          baseRotate={-8}
          baseTranslateY={12}
          floatRange={9}
        />
        <View style={styles.pinCenter}>
          <MapPin
            icon="hammer-wrench"
            size="lg"
            delay={200}
            baseTranslateY={-4}
            floatRange={12}
          />
        </View>
        <MapPin
          icon="package-variant-closed"
          size="sm"
          delay={400}
          baseRotate={8}
          baseTranslateY={12}
          floatRange={9}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    marginTop: 8,
  },
  pins: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 28,
  },
  pinWrap: {
    alignItems: "center",
    opacity: 0.95,
  },
  pin: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#5B21B6",
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  pinInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  pinInnerLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  pinTip: {
    height: 10,
    backgroundColor: "#4C1D95",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  pinCenter: {
    zIndex: 2,
  },
});
