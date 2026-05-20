import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type Props = TextInputProps & {
  error?: boolean;
};

export const MinimalPhoneField = forwardRef<TextInput, Props>(
  function MinimalPhoneField({ error, style, onFocus, onBlur, ...rest }, ref) {
    const [focused, setFocused] = useState(false);

    const lineActive = focused && !error;
    const lineError = Boolean(error);

    return (
      <View style={styles.block}>
        <Text style={[styles.label, { fontFamily: AUTH_FONT.semibold }]}>
          Mobile number
        </Text>
        <View style={styles.wrap}>
          <View
            style={[
              styles.prefixPill,
              lineActive && styles.prefixPillActive,
              lineError && styles.prefixPillError,
            ]}
          >
            <Text style={[styles.prefix, { fontFamily: AUTH_FONT.bold }]}>+91</Text>
          </View>
          <View
            style={[
              styles.fieldShell,
              lineActive && styles.fieldShellActive,
              lineError && styles.fieldShellError,
            ]}
          >
            <TextInput
              ref={ref}
              placeholder="00000 00000"
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
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  block: {
    marginTop: 20,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 10,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  prefixPill: {
    paddingHorizontal: 12,
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
  prefix: {
    fontSize: 16,
    color: AUTH_PRIMARY,
    letterSpacing: 0.5,
  },
  fieldShell: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(248,250,252,0.95)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  fieldShellActive: {
    borderColor: "rgba(37,99,235,0.45)",
    backgroundColor: "#fff",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldShellError: {
    borderColor: "rgba(239,68,68,0.45)",
    backgroundColor: "rgba(254,242,242,0.6)",
  },
  input: {
    fontSize: 18,
    color: "#0f172a",
    letterSpacing: 1.2,
    paddingVertical: 0,
  },
});
