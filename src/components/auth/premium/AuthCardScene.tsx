import { LoginAuthCard } from "@/components/auth/premium/LoginAuthCard";
import { RegisterAuthCard } from "@/components/auth/premium/RegisterAuthCard";
import { WelcomeAuthCard } from "@/components/auth/premium/WelcomeAuthCard";
import { AUTH_FONT } from "@/constants/authPremium";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export type AuthFocus = "welcome" | "login" | "register";

const FOCUS_ORDER: AuthFocus[] = ["welcome", "login", "register"];

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W * 0.78, 340);

type LoginCardProps = React.ComponentProps<typeof LoginAuthCard>;
type Props = {
  login: LoginCardProps;
  onFocusLogin: () => void;
  onFocusRegister: () => void;
  onRegisterComplete?: (phone?: string) => void;
  initialFocus?: AuthFocus;
  registerPhoneSeed?: string;
  onSocialHint?: (message: string) => void;
};

function focusIndex(f: AuthFocus) {
  return FOCUS_ORDER.indexOf(f);
}

function FloatingCardShell({
  focus,
  cardFocus,
  children,
  onPress,
}: {
  focus: AuthFocus;
  cardFocus: AuthFocus;
  children: React.ReactNode;
  onPress: () => void;
}) {
  const offset = focusIndex(cardFocus) - focusIndex(focus);
  const floatY = useSharedValue(0);
  const focusProgress = useSharedValue(offset === 0 ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withSpring(offset === 0 ? 1 : 0, {
      damping: 16,
      stiffness: 140,
    });
  }, [focusProgress, offset]);

  useEffect(() => {
    const amp = offset === 0 ? 7 : 5;
    floatY.value = withRepeat(
      withSequence(
        withTiming(-amp, { duration: 2600 + Math.abs(offset) * 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(amp * 0.65, { duration: 2600 + Math.abs(offset) * 200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [floatY, offset]);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const spread = isTablet ? 200 : Math.min(118, SCREEN_W * 0.28);

  const animStyle = useAnimatedStyle(() => {
    const center = focusProgress.value;
    const side = 1 - center;
    const x =
      offset === 0
        ? 0
        : offset < 0
          ? interpolate(side, [0, 1], [-spread * 0.35, -spread])
          : interpolate(side, [0, 1], [spread * 0.35, spread]);
    const scale =
      offset === 0
        ? interpolate(center, [0, 1], [0.88, 1])
        : interpolate(side, [0, 1], [0.72, 0.84]);
    const rotate =
      offset === 0
        ? interpolate(center, [0, 1], [offset < 0 ? -5 : 5, 0])
        : offset < 0
          ? -9
          : 9;
    const opacity =
      offset === 0
        ? interpolate(center, [0, 1], [0.78, 1])
        : interpolate(side, [0, 1], [0.45, 0.82]);

    return {
      opacity,
      zIndex: offset === 0 ? 30 : 20 - Math.abs(offset),
      transform: [
        { translateX: x },
        { translateY: floatY.value + (offset === 0 ? -6 : 8) },
        { scale },
        { rotate: `${rotate}deg` },
        { perspective: 900 },
      ],
    };
  });

  const isCenter = offset === 0;

  return (
    <Animated.View
      entering={FadeIn.duration(500).delay(Math.abs(offset) * 80)}
      style={[styles.cardLayer, { width: CARD_W }, animStyle]}
    >
      <Pressable
        onPress={onPress}
        disabled={isCenter}
        accessibilityRole="button"
        accessibilityState={{ selected: isCenter }}
        style={styles.cardPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function AuthCardScene({
  login,
  onFocusLogin,
  onFocusRegister,
  initialFocus = "login",
  registerPhoneSeed,
  onRegisterComplete,
  onSocialHint,
}: Props) {
  const [focus, setFocus] = useState<AuthFocus>(initialFocus);

  const goLogin = useCallback(() => {
    setFocus("login");
    setTimeout(onFocusLogin, 280);
  }, [onFocusLogin]);

  const goRegister = useCallback(() => {
    setFocus("register");
    setTimeout(onFocusRegister, 280);
  }, [onFocusRegister]);

  const goWelcome = useCallback(() => setFocus("welcome"), []);

  return (
    <Animated.View entering={FadeIn.duration(480)} style={styles.wrap}>
      <View style={styles.stage}>
        <FloatingCardShell focus={focus} cardFocus="welcome" onPress={goWelcome}>
          <WelcomeAuthCard onLogin={goLogin} onRegister={goRegister} compact={focus !== "welcome"} />
        </FloatingCardShell>

        <FloatingCardShell focus={focus} cardFocus="login" onPress={goLogin}>
          <LoginAuthCard
            {...login}
            isFocused={focus === "login"}
            onSocialHint={onSocialHint}
          />
        </FloatingCardShell>

        <FloatingCardShell focus={focus} cardFocus="register" onPress={goRegister}>
          <RegisterAuthCard
            onCreateAccount={(phone) => {
              onRegisterComplete?.(phone);
              goLogin();
            }}
            initialPhone={registerPhoneSeed}
            compact={focus !== "register"}
            onSocialHint={onSocialHint}
          />
        </FloatingCardShell>
      </View>

      <Animated.View entering={FadeInDown.duration(360).delay(120)} style={styles.chrome}>
        <View style={styles.dotPill}>
          {FOCUS_ORDER.map((f) => (
            <Pressable
              key={f}
              onPress={() => {
                if (f === "login") goLogin();
                else if (f === "register") goRegister();
                else goWelcome();
              }}
              accessibilityRole="button"
              style={[styles.dotHit, focus === f && styles.dotHitActive]}
            >
              <View style={[styles.dot, focus === f && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <Text style={[styles.hint, { fontFamily: AUTH_FONT.medium }]}>
          Tap a card · InstaHelp
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  stage: {
    width: SCREEN_W,
    minHeight: 440,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLayer: {
    position: "absolute",
    alignSelf: "center",
  },
  cardPress: {
    width: "100%",
  },
  chrome: {
    alignItems: "center",
    marginTop: 12,
    width: "100%",
  },
  dotPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  dotHit: {
    padding: 6,
  },
  dotHitActive: {},
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#fff",
  },
  hint: {
    marginTop: 10,
    fontSize: 10,
    color: "rgba(255,255,255,0.42)",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
});
