import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { forwardRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = TextInputProps & {
  error?: boolean;
};

export const MinimalPhoneField = forwardRef<TextInput, Props>(
  function MinimalPhoneField({ error, style, onFocus, onBlur, value, ...rest }, ref) {
    const [focused, setFocused] = useState(false);
    const labelY = useSharedValue(0);
    const labelScale = useSharedValue(1);
    const glow = useSharedValue(0);

    const hasValue = Boolean(value && String(value).length > 0);
    const floated = focused || hasValue;

    useEffect(() => {
      labelY.value = withSpring(floated ? -22 : 0, { damping: 14, stiffness: 180 });
      labelScale.value = withSpring(floated ? 0.82 : 1, { damping: 14, stiffness: 180 });
      glow.value = withTiming(focused && !error ? 1 : 0, { duration: 200 });
    }, [error, floated, focused, glow, labelScale, labelY]);

    const labelStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: labelY.value }, { scale: labelScale.value }],
      opacity: floated ? 0.9 : 0.75,
    }));

    const shellStyle = useAnimatedStyle(() => ({
      borderColor:
        error
          ? "rgba(239,68,68,0.55)"
          : glow.value > 0.5
            ? "rgba(37,99,235,0.55)"
            : "rgba(148,163,184,0.28)",
      shadowOpacity: glow.value * 0.18,
    }));

    return (
      <View style={styles.block}>
        <Animated.Text
          style={[styles.floatingLabel, labelStyle, { fontFamily: AUTH_FONT.semibold }]}
          pointerEvents="none"
        >
          Mobile number
        </Animated.Text>
        <View style={styles.wrap}>
          <View
            style={[
              styles.prefixPill,
              focused && !error && styles.prefixPillActive,
              error && styles.prefixPillError,
            ]}
          >
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={[styles.prefix, { fontFamily: AUTH_FONT.bold }]}>+91</Text>
          </View>
          <Animated.View style={[styles.fieldShell, shellStyle]}>
            <TextInput
              ref={ref}
              value={value}
              placeholder={floated ? "10-digit mobile number" : ""}
              placeholderTextColor="#cbd5e1"
              keyboardType="phone-pad"
              maxLength={10}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              style={[
                styles.input,
                { fontFamily: AUTH_FONT.medium },
                style,
              ]}
              {...rest}
            />
          </Animated.View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  block: {
    marginTop: 24,
    paddingTop: 8,
  },
  floatingLabel: {
    position: "absolute",
    left: 4,
    top: 0,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#64748b",
    zIndex: 2,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginTop: 8,
  },
  prefixPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(37,99,235,0.08)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.12)",
    justifyContent: "center",
  },
  prefixPillActive: {
    backgroundColor: "rgba(37,99,235,0.12)",
    borderColor: "rgba(37,99,235,0.28)",
  },
  prefixPillError: {
    borderColor: "rgba(248,113,113,0.6)",
    backgroundColor: "rgba(254,226,226,0.5)",
  },
  flag: { fontSize: 16 },
  prefix: {
    fontSize: 15,
    color: AUTH_PRIMARY,
    letterSpacing: 0.5,
  },
  fieldShell: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(248,250,252,0.98)",
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    justifyContent: "center",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    fontSize: 18,
    color: "#0f172a",
    letterSpacing: 1.1,
    paddingVertical: 0,
  },
});
