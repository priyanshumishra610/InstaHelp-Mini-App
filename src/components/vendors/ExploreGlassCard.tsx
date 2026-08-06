import { GlassSurface, type GlassIntensity } from "@/components/ui/GlassSurface";
import { RADIUS } from "@/constants/designSystem";
import { ACCENT, ACCENT_DEEP, HERO_LAVENDER_MIST } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = PropsWithChildren<{
  radius?: number;
  intensity?: GlassIntensity;
  style?: StyleProp<ViewStyle>;
  accentEdge?: boolean;
}>;

/** Full live-blur glass card for Explore surfaces. */
export function ExploreGlassCard({
  children,
  radius = RADIUS.xl,
  intensity = "medium",
  style,
  accentEdge = true,
}: Props) {
  return (
    <GlassSurface
      blur
      intensity={intensity}
      shadow="md"
      radius={radius}
      style={[styles.outer, style]}
    >
      <View style={[styles.inner, { borderRadius: radius }]}>
        <View
          pointerEvents="none"
          style={[styles.lavenderWash, { borderRadius: radius }]}
        />
        <View
          pointerEvents="none"
          style={[styles.blueWash, { borderRadius: radius }]}
        />
        {accentEdge ? (
          <LinearGradient
            pointerEvents="none"
            colors={[ACCENT, ACCENT_DEEP, "transparent"]}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
  },
  inner: {
    overflow: "hidden",
    position: "relative",
  },
  blueWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,74,173,0.035)",
  },
  lavenderWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${HERO_LAVENDER_MIST}88`,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    zIndex: 2,
    opacity: 0.85,
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
