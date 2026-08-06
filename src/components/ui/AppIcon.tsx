import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { APP_ICONS, type AppIconKey } from "@/constants/icons";
import { ACCENT } from "@/constants/theme";
import { COLORS, RADIUS } from "@/constants/designSystem";

type MciName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  /** Semantic app icon, or a raw MaterialCommunityIcons glyph */
  name: AppIconKey | MciName;
  size?: number;
  color?: string;
  /** Prefer filled glyph when the semantic entry has filled/outlined */
  filled?: boolean;
  /** Optional soft circular/container chip behind the glyph */
  chip?: boolean;
  chipColor?: string;
  style?: StyleProp<ViewStyle>;
};

function resolveName(name: AppIconKey | MciName, filled: boolean): MciName {
  const entry = (APP_ICONS as Record<string, unknown>)[name as string];
  if (entry && typeof entry === "object" && entry !== null && "filled" in entry) {
    const pair = entry as { filled: MciName; outlined: MciName };
    return filled ? pair.filled : pair.outlined;
  }
  if (typeof entry === "string") return entry as MciName;
  return name as MciName;
}

/**
 * Single Material Design 3–aligned icon surface for the app.
 * Prefer this over ad-hoc Ionicons for new UI.
 */
export function AppIcon({
  name,
  size = 22,
  color = COLORS.ink,
  filled = false,
  chip = false,
  chipColor = COLORS.accentSoft,
  style,
}: Props) {
  const glyph = resolveName(name, filled);
  const icon = (
    <MaterialCommunityIcons name={glyph} size={size} color={color} />
  );

  if (!chip) return icon;

  const pad = Math.round(size * 0.55);
  return (
    <View
      style={[
        {
          width: size + pad * 2,
          height: size + pad * 2,
          borderRadius: RADIUS.md,
          backgroundColor: chipColor,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {icon}
    </View>
  );
}

/** Convenience for accent-tinted action chips */
export function AppIconAccent({
  name,
  size = 18,
  filled = false,
}: Pick<Props, "name" | "size" | "filled">) {
  return <AppIcon name={name} size={size} color={ACCENT} filled={filled} chip />;
}
