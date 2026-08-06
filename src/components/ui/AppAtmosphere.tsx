import { ACCENT, ACCENT_SOFT, HERO_CANVAS, HERO_LAVENDER, HERO_LAVENDER_MIST, PAPER } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

type Variant = "app" | "auth" | "hero";

type Props = {
  variant?: Variant;
};

/** Ambient backdrop aligned with splash / auth (lavender canvas + blue wash). */
export function AppAtmosphere({ variant = "app" }: Props) {
  const base = variant === "hero" || variant === "auth" ? HERO_CANVAS : PAPER;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: base }]} />
      <LinearGradient
        colors={
          variant === "hero"
            ? [HERO_LAVENDER, HERO_CANVAS, HERO_CANVAS]
            : variant === "auth"
              ? [HERO_LAVENDER_MIST, HERO_CANVAS, PAPER]
              : [ACCENT_SOFT, PAPER, PAPER]
        }
        locations={[0, 0.32, 1]}
        style={StyleSheet.absoluteFill}
      />
      {variant === "hero" ? (
        <LinearGradient
          pointerEvents="none"
          colors={[`${HERO_LAVENDER_MIST}55`, "transparent"]}
          style={[StyleSheet.absoluteFill, { height: 320 }]}
        />
      ) : null}
    </View>
  );
}
