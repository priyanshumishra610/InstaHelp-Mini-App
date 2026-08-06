import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

type Variant = "app" | "auth" | "hero";

type Props = {
  variant?: Variant;
};

/** Ambient backdrop — follows active appearance (light/dark + paper tone). */
export function AppAtmosphere({ variant = "app" }: Props) {
  const { colors, isDark } = useAppTheme();

  if (variant === "app" || variant === "hero") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.canvas }]}
        />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.canvas }]}
      />
      <LinearGradient
        colors={
          isDark
            ? [colors.heroMist, colors.canvas, colors.paper]
            : [colors.accentSoft, colors.canvas, colors.paper]
        }
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
