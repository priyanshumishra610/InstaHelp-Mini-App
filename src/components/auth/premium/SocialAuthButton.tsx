import { AUTH_FONT } from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";

type Provider = "google" | "apple";

type Props = {
  provider: Provider;
  label?: string;
  onPress: () => void;
  compact?: boolean;
};

const META: Record<
  Provider,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; defaultLabel: string }
> = {
  google: {
    icon: "logo-google",
    color: "#EA4335",
    bg: "rgba(255,255,255,0.95)",
    defaultLabel: "Continue with Google",
  },
  apple: {
    icon: "logo-apple",
    color: "#0f172a",
    bg: "rgba(255,255,255,0.95)",
    defaultLabel: "Continue with Apple",
  },
};

export function SocialAuthButton({ provider, label, onPress, compact }: Props) {
  const meta = META[provider];
  return (
    <PremiumPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? meta.defaultLabel}
      style={[styles.btn, compact && styles.btnCompact]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={compact ? 16 : 18} color={meta.color} />
      </View>
      <Text
        style={[
          styles.label,
          { fontFamily: AUTH_FONT.semibold },
          compact && styles.labelCompact,
        ]}
        numberOfLines={1}
      >
        {label ?? meta.defaultLabel}
      </Text>
    </PremiumPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(248,250,252,0.95)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.28)",
  },
  btnCompact: {
    flex: 1,
    paddingVertical: 11,
    gap: 6,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    color: "#0f172a",
    letterSpacing: 0.1,
  },
  labelCompact: {
    fontSize: 11,
  },
});
