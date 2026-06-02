import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const LENGTH = 6;
const BOX_STAGGER_MS = 90;
const FEEDBACK_STAGGER_MS = 110;

export type OtpFeedback = "idle" | "success" | "error";

const NEUTRAL_BORDER = "rgba(148,163,184,0.35)";
const NEUTRAL_BG = "#1E1E28";
const SUCCESS_BORDER = "#22C55E";
const SUCCESS_BG = "rgba(34,197,94,0.22)";
const ERROR_BORDER = "#EF4444";
const ERROR_BG = "rgba(239,68,68,0.22)";

type BoxProps = {
  digit: string;
  active: boolean;
  index: number;
  feedback: OtpFeedback;
  disabled?: boolean;
};

function OtpBox({ digit, active, index, feedback, disabled }: BoxProps) {
  const entrance = useSharedValue(0);
  const fillScale = useSharedValue(1);
  const feedbackPhase = useSharedValue(0);

  useEffect(() => {
    entrance.value = withDelay(
      index * BOX_STAGGER_MS,
      withSpring(1, { damping: 14, stiffness: 220 }),
    );
  }, [entrance, index]);

  useEffect(() => {
    if (!digit) return;
    fillScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 }),
    );
  }, [digit, fillScale]);

  useEffect(() => {
    if (feedback === "idle") {
      feedbackPhase.value = withTiming(0, { duration: 120 });
      return;
    }

    const delay = index * FEEDBACK_STAGGER_MS;
    if (feedback === "success") {
      feedbackPhase.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 160 }),
          withSpring(1.06, { damping: 10, stiffness: 380 }),
          withSpring(1, { damping: 14, stiffness: 280 }),
        ),
      );
      return;
    }

    feedbackPhase.value = withDelay(
      delay,
      withSequence(
        withTiming(-1, { duration: 140 }),
        withSpring(0.94, { damping: 6, stiffness: 520 }),
        withSpring(1, { damping: 10, stiffness: 300 }),
      ),
    );
  }, [feedback, feedbackPhase, index]);

  const anim = useAnimatedStyle(() => {
    const phase = feedbackPhase.value;
    const isSuccess = phase > 0.4;
    const isError = phase < -0.4;
    const borderColor = isSuccess
      ? SUCCESS_BORDER
      : isError
        ? ERROR_BORDER
        : active && !disabled
          ? AUTH_PRIMARY
          : NEUTRAL_BORDER;
    const backgroundColor = isSuccess
      ? SUCCESS_BG
      : isError
        ? ERROR_BG
        : active && !disabled
          ? "#252532"
          : NEUTRAL_BG;

    return {
      opacity: entrance.value,
      transform: [
        { scale: entrance.value * fillScale.value },
        { translateY: (1 - entrance.value) * 14 },
      ],
      borderColor,
      backgroundColor,
      shadowColor: isSuccess
        ? SUCCESS_BORDER
        : isError
          ? ERROR_BORDER
          : "transparent",
      shadowOpacity: isSuccess || isError ? 0.45 : 0,
      shadowRadius: isSuccess || isError ? 8 : 0,
      shadowOffset: { width: 0, height: 2 },
      elevation: isSuccess || isError ? 4 : 0,
    };
  });

  const digitAnim = useAnimatedStyle(() => {
    const phase = feedbackPhase.value;
    return {
      color: interpolateColor(
        phase,
        [-1, 0, 1],
        ["#FCA5A5", "#FFFFFF", "#86EFAC"],
      ),
    };
  });

  return (
    <Animated.View style={[styles.box, anim]}>
      <Animated.Text style={[styles.digit, digitAnim, { fontFamily: AUTH_FONT.bold }]}>
        {digit}
      </Animated.Text>
    </Animated.View>
  );
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  feedback?: OtpFeedback;
  onComplete?: (code: string) => void;
};

export function OtpCodeInput({
  value,
  onChange,
  disabled,
  feedback = "idle",
  onComplete,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const completedRef = useRef(false);
  const digits = value.replace(/\D/g, "").slice(0, LENGTH).split("");
  const activeIndex = Math.min(digits.length, LENGTH - 1);

  const handleChange = useCallback(
    (text: string) => {
      const next = text.replace(/\D/g, "").slice(0, LENGTH);
      if (next.length > value.length) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onChange(next);
      if (next.length === LENGTH && !completedRef.current) {
        completedRef.current = true;
        onComplete?.(next);
      }
      if (next.length < LENGTH) {
        completedRef.current = false;
      }
    },
    [onChange, onComplete, value.length],
  );

  useEffect(() => {
    if (feedback !== "idle") {
      completedRef.current = false;
    }
  }, [feedback]);

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
            <OtpBox
              key={i}
              digit={digits[i] ?? ""}
              active={!disabled && activeIndex === i && digits.length < LENGTH}
              index={i}
              feedback={feedback}
              disabled={disabled}
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
    minWidth: 0,
    maxWidth: 48,
    aspectRatio: 0.9,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    fontSize: 20,
  },
  hidden: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
