import { AUTH_ACCENT_TEAL, AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const BOX_COUNT = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  visible?: boolean;
  onComplete?: () => void;
};

function OtpBox({
  digit,
  active,
  filled,
}: {
  digit: string;
  active: boolean;
  filled: boolean;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (filled) {
      scale.value = withSequence(
        withSpring(1.08, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 300 }),
      );
      glow.value = withTiming(1, { duration: 200 });
    }
  }, [filled, glow, scale]);

  useEffect(() => {
    if (active) glow.value = withTiming(1, { duration: 180 });
    else if (!filled) glow.value = withTiming(0, { duration: 180 });
  }, [active, filled, glow]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor:
      glow.value > 0.5
        ? active
          ? AUTH_PRIMARY
          : AUTH_ACCENT_TEAL
        : "rgba(148,163,184,0.35)",
    shadowOpacity: glow.value * 0.25,
  }));

  return (
    <Animated.View style={[styles.box, active && styles.boxActive, anim]}>
      <Text style={[styles.digit, { fontFamily: AUTH_FONT.bold }]}>{digit}</Text>
      {active && !digit ? <View style={styles.cursor} /> : null}
    </Animated.View>
  );
}

export function OtpInputRow({ value, onChange, visible = true, onComplete }: Props) {
  const hiddenRef = useRef<TextInput>(null);
  const digits = value.replace(/\D/g, "").slice(0, BOX_COUNT).split("");
  const activeIndex = Math.min(digits.length, BOX_COUNT - 1);

  const handleChange = useCallback(
    (text: string) => {
      const next = text.replace(/\D/g, "").slice(0, BOX_COUNT);
      onChange(next);
      if (next.length > value.length) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (next.length === BOX_COUNT) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete?.();
      }
    },
    [onChange, onComplete, value.length],
  );

  const onKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === "Backspace" && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    },
    [onChange, value],
  );

  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { fontFamily: AUTH_FONT.semibold }]}>
        Enter OTP
      </Text>
      <Pressable onPress={() => hiddenRef.current?.focus()} accessibilityRole="button">
        <View style={styles.row}>
          {Array.from({ length: BOX_COUNT }, (_, i) => (
            <OtpBox
              key={i}
              digit={digits[i] ?? ""}
              active={activeIndex === i && digits.length < BOX_COUNT}
              filled={Boolean(digits[i])}
            />
          ))}
        </View>
      </Pressable>
      <TextInput
        ref={hiddenRef}
        value={value}
        onChangeText={handleChange}
        onKeyPress={onKeyPress}
        keyboardType="number-pad"
        maxLength={BOX_COUNT}
        style={styles.hidden}
        caretHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  label: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  box: {
    flex: 1,
    maxWidth: 48,
    aspectRatio: 0.92,
    borderRadius: 14,
    backgroundColor: "rgba(248,250,252,0.98)",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  boxActive: {
    backgroundColor: "#fff",
  },
  digit: {
    fontSize: 20,
    color: "#0f172a",
    letterSpacing: 0,
  },
  cursor: {
    position: "absolute",
    width: 2,
    height: 20,
    borderRadius: 1,
    backgroundColor: AUTH_PRIMARY,
    opacity: 0.8,
  },
  hidden: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
