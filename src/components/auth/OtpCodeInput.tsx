import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const LENGTH = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function Box({
  digit,
  active,
}: {
  digit: string;
  active: boolean;
}) {
  const scale = useSharedValue(1);

  if (digit) {
    scale.value = withSequence(
      withSpring(1.06, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 }),
    );
  }

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: active ? AUTH_PRIMARY : "rgba(148,163,184,0.35)",
  }));

  return (
    <Animated.View style={[styles.box, active && styles.boxActive, anim]}>
      <Text style={[styles.digit, { fontFamily: AUTH_FONT.bold }]}>{digit}</Text>
    </Animated.View>
  );
}

export function OtpCodeInput({ value, onChange, disabled }: Props) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.replace(/\D/g, "").slice(0, LENGTH).split("");
  const activeIndex = Math.min(digits.length, LENGTH - 1);

  const handleChange = useCallback(
    (text: string) => {
      const next = text.replace(/\D/g, "").slice(0, LENGTH);
      if (next.length > value.length) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onChange(next);
    },
    [onChange, value.length],
  );

  return (
    <View>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Enter OTP"
      >
        <View style={styles.row}>
          {Array.from({ length: LENGTH }, (_, i) => (
            <Box
              key={i}
              digit={digits[i] ?? ""}
              active={!disabled && activeIndex === i && digits.length < LENGTH}
            />
          ))}
        </View>
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={LENGTH}
        editable={!disabled}
        style={styles.hidden}
        caretHidden
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  box: {
    flex: 1,
    maxWidth: 48,
    aspectRatio: 0.9,
    borderRadius: 14,
    backgroundColor: "#1E1E28",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: {
    borderColor: AUTH_PRIMARY,
    backgroundColor: "#252532",
  },
  digit: {
    fontSize: 20,
    color: "#fff",
  },
  hidden: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
