import { useEffect } from "react";
import {
  Image,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const LOGO = require("../../../assets/images/InstaHelp.png");
const ACCENT = "#ffd500";
const ACCENT_DEEP = "#a88a00";
const LOGO_BRAND = "#3d2bb3";

type Props = {
  onFinish?: () => void;
  minDurationMs?: number;
};

const AnimatedView = Animated.View;

const PARTICLES = [
  { top: -90, left: -110, size: 6, delay: 0, range: 12 },
  { top: -60, left: 120, size: 8, delay: 250, range: 16 },
  { top: 60, left: -130, size: 5, delay: 500, range: 10 },
  { top: 110, left: 80, size: 7, delay: 700, range: 14 },
  { top: 150, left: -70, size: 5, delay: 950, range: 11 },
  { top: -120, left: 60, size: 4, delay: 1200, range: 9 },
];

function Particle({
  top,
  left,
  size,
  delay,
  range,
}: {
  top: number;
  left: number;
  size: number;
  delay: number;
  range: number;
}) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 700 }));
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );

    return () => {
      cancelAnimation(progress);
      cancelAnimation(opacity);
    };
  }, [delay, opacity, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value * (0.4 + progress.value * 0.6),
    transform: [
      { translateY: -range / 2 + progress.value * range },
      { scale: 0.8 + progress.value * 0.4 },
    ],
  }));

  return (
    <AnimatedView
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: ACCENT,
        },
        style,
      ]}
    />
  );
}

export function AnimatedSplash({ onFinish, minDurationMs = 2100 }: Props) {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const { width: screenWidth } = useWindowDimensions();

  const containerOpacity = useSharedValue(1);

  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-12);

  const haloScale = useSharedValue(0.85);
  const haloOpacity = useSharedValue(0.45);

  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.55);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.45);
  const ring3Scale = useSharedValue(1);
  const ring3Opacity = useSharedValue(0.35);

  const shineX = useSharedValue(-180);

  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(10);

  const brandOpacity = useSharedValue(0);
  const brandY = useSharedValue(8);

  const progressX = useSharedValue(-220);

  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 360 });
    logoScale.value = withSpring(1, {
      damping: 11,
      stiffness: 130,
      mass: 0.95,
    });
    logoRotate.value = withSpring(0, { damping: 14, stiffness: 160 });

    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.65, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0.25, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      true,
    );
    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.15, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0.9, {
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      true,
    );

    const startSonar = (
      scaleSv: typeof ring1Scale,
      opacitySv: typeof ring1Opacity,
      delay: number,
    ) => {
      scaleSv.value = withDelay(
        delay,
        withRepeat(
          withTiming(2.4, {
            duration: 2200,
            easing: Easing.out(Easing.quad),
          }),
          -1,
          false,
        ),
      );
      opacitySv.value = withDelay(
        delay,
        withRepeat(
          withTiming(0, {
            duration: 2200,
            easing: Easing.out(Easing.quad),
          }),
          -1,
          false,
        ),
      );
    };
    startSonar(ring1Scale, ring1Opacity, 200);
    startSonar(ring2Scale, ring2Opacity, 800);
    startSonar(ring3Scale, ring3Opacity, 1400);

    shineX.value = withDelay(
      450,
      withRepeat(
        withTiming(220, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
        -1,
        false,
      ),
    );

    brandOpacity.value = withDelay(420, withTiming(1, { duration: 480 }));
    brandY.value = withDelay(
      420,
      withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );

    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 520 }));
    taglineY.value = withDelay(
      700,
      withTiming(0, { duration: 560, easing: Easing.out(Easing.cubic) }),
    );

    progressX.value = withDelay(
      300,
      withTiming(220, {
        duration: minDurationMs - 300,
        easing: Easing.inOut(Easing.cubic),
      }),
    );

    const dotPulse = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }),
            withTiming(0.3, { duration: 380, easing: Easing.in(Easing.quad) }),
          ),
          -1,
          false,
        ),
      );
    };
    dotPulse(dot1, 800);
    dotPulse(dot2, 950);
    dotPulse(dot3, 1100);

    return () => {
      cancelAnimation(logoOpacity);
      cancelAnimation(logoScale);
      cancelAnimation(logoRotate);
      cancelAnimation(haloOpacity);
      cancelAnimation(haloScale);
      cancelAnimation(ring1Scale);
      cancelAnimation(ring1Opacity);
      cancelAnimation(ring2Scale);
      cancelAnimation(ring2Opacity);
      cancelAnimation(ring3Scale);
      cancelAnimation(ring3Opacity);
      cancelAnimation(shineX);
      cancelAnimation(brandOpacity);
      cancelAnimation(brandY);
      cancelAnimation(taglineOpacity);
      cancelAnimation(taglineY);
      cancelAnimation(progressX);
      cancelAnimation(dot1);
      cancelAnimation(dot2);
      cancelAnimation(dot3);
    };
  }, [
    brandOpacity,
    brandY,
    dot1,
    dot2,
    dot3,
    haloOpacity,
    haloScale,
    logoOpacity,
    logoRotate,
    logoScale,
    minDurationMs,
    progressX,
    ring1Opacity,
    ring1Scale,
    ring2Opacity,
    ring2Scale,
    ring3Opacity,
    ring3Scale,
    shineX,
    taglineOpacity,
    taglineY,
  ]);

  useEffect(() => {
    if (!onFinish) return;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let didFinish = false;
    const safeFinish = () => {
      if (didFinish) return;
      didFinish = true;
      onFinish();
    };
    const startTimer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: 360, easing: Easing.out(Easing.cubic) },
        (finished) => {
          "worklet";
          if (finished) runOnJS(safeFinish)();
        },
      );
      fallbackTimer = setTimeout(safeFinish, 600);
    }, minDurationMs);
    return () => {
      clearTimeout(startTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [onFinish, minDurationMs, containerOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));
  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));
  const ring3Style = useAnimatedStyle(() => ({
    opacity: ring3Opacity.value,
    transform: [{ scale: ring3Scale.value }],
  }));
  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shineX.value },
      { rotate: "20deg" },
    ],
  }));
  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressX.value }],
  }));
  const dotStyle1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dotStyle2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dotStyle3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <AnimatedView
      style={[
        {
          flex: 1,
          backgroundColor: dark ? "#0B0B0C" : "#FAF8EC",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          overflow: "hidden",
        },
        containerStyle,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -screenWidth * 0.4,
          right: -screenWidth * 0.35,
          width: screenWidth * 1.1,
          height: screenWidth * 1.1,
          borderRadius: screenWidth,
          backgroundColor: ACCENT,
          opacity: dark ? 0.07 : 0.18,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -screenWidth * 0.45,
          left: -screenWidth * 0.4,
          width: screenWidth * 1.05,
          height: screenWidth * 1.05,
          borderRadius: screenWidth,
          backgroundColor: ACCENT,
          opacity: dark ? 0.05 : 0.12,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: "30%",
          left: "10%",
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: ACCENT_DEEP,
          opacity: 0.35,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: ACCENT_DEEP,
          opacity: 0.3,
        }}
      />

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: 220,
            height: 220,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {PARTICLES.map((p, i) => (
            <Particle key={i} {...p} />
          ))}

          <AnimatedView
            style={[
              {
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: 110,
                borderWidth: 1.5,
                borderColor: ACCENT,
              },
              ring3Style,
            ]}
          />
          <AnimatedView
            style={[
              {
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: 100,
                borderWidth: 1.5,
                borderColor: ACCENT,
              },
              ring2Style,
            ]}
          />
          <AnimatedView
            style={[
              {
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: 90,
                borderWidth: 1.8,
                borderColor: ACCENT,
              },
              ring1Style,
            ]}
          />

          <AnimatedView
            style={[
              {
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: ACCENT,
                opacity: 0.45,
              },
              haloStyle,
            ]}
          />

          <AnimatedView
            style={[
              {
                width: 132,
                height: 132,
                borderRadius: 32,
                overflow: "hidden",
                shadowColor: LOGO_BRAND,
                shadowOpacity: 0.35,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 14 },
                elevation: 14,
              },
              logoStyle,
            ]}
          >
            <Image
              source={LOGO}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
            <AnimatedView
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: -40,
                  left: -40,
                  width: 60,
                  height: 220,
                  backgroundColor: "rgba(255,255,255,0.35)",
                },
                shineStyle,
              ]}
            />
          </AnimatedView>
        </View>

        <AnimatedView
          style={[
            {
              marginTop: 36,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            },
            brandStyle,
          ]}
        >
          <View
            style={{
              backgroundColor: dark ? "rgba(255,213,0,0.12)" : "rgba(255,213,0,0.18)",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: dark ? "rgba(255,213,0,0.28)" : "rgba(255,213,0,0.4)",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: dark ? ACCENT : ACCENT_DEEP,
              }}
            >
              Premium concierge
            </Text>
          </View>
        </AnimatedView>

        <AnimatedView
          style={[{ marginTop: 14, alignItems: "center" }, taglineStyle]}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: 0.2,
              color: dark ? "#fafafa" : "#1a1a1a",
            }}
          >
            Everyday help, instantly handled.
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: "500",
              color: dark ? "#9ca3af" : "#6b7280",
              letterSpacing: 0.2,
            }}
          >
            Vendors, coordination, follow-through. All for you.
          </Text>
        </AnimatedView>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 88,
          width: 220,
          height: 3,
          borderRadius: 2,
          backgroundColor: dark ? "rgba(255,213,0,0.15)" : "rgba(168,138,0,0.18)",
          overflow: "hidden",
        }}
      >
        <AnimatedView
          style={[
            {
              width: 90,
              height: 3,
              borderRadius: 2,
              backgroundColor: ACCENT,
            },
            progressStyle,
          ]}
        />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 56,
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <AnimatedView
          style={[
            {
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: ACCENT_DEEP,
            },
            dotStyle1,
          ]}
        />
        <AnimatedView
          style={[
            {
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: ACCENT_DEEP,
            },
            dotStyle2,
          ]}
        />
        <AnimatedView
          style={[
            {
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: ACCENT_DEEP,
            },
            dotStyle3,
          ]}
        />
      </View>
    </AnimatedView>
  );
}
