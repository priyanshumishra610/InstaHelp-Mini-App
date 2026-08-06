import { GLASS } from "@/constants/designSystem";
import { HERO_LAVENDER, HERO_LAVENDER_MIST } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Platform, StyleSheet, View } from "react-native";

const ORBS = [
  { size: 120, top: -20, right: -30, delay: 0, dx: 8, dy: 12, color: HERO_LAVENDER_MIST },
  { size: 88, top: 48, left: -24, delay: 200, dx: -10, dy: 8, color: HERO_LAVENDER },
  { size: 64, top: 120, right: 40, delay: 400, dx: 6, dy: -10, color: "rgba(23,23,23,0.06)" },
] as const;

/** Soft floating glass orbs — home header ambience only. */
export function HomeAmbientOrbs() {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {ORBS.map((orb, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: [0.45, 0.75, 0.45],
            scale: [0.96, 1.04, 0.96],
            translateX: [0, orb.dx, 0],
            translateY: [0, orb.dy, 0],
          }}
          transition={{
            type: "timing",
            duration: 4200 + index * 600,
            delay: orb.delay,
            loop: true,
          }}
          style={[
            styles.orbWrap,
            {
              width: orb.size,
              height: orb.size,
              borderRadius: orb.size / 2,
              top: orb.top,
              left: "left" in orb ? orb.left : undefined,
              right: "right" in orb ? orb.right : undefined,
            },
          ]}
        >
          {Platform.OS !== "web" ? (
            <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
          ) : null}
          <LinearGradient
            colors={[GLASS.fillStrong, orb.color, "rgba(255,255,255,0.15)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.orbRim} />
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  orbWrap: {
    position: "absolute",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  orbRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: GLASS.rim,
    borderRadius: 999,
  },
});
