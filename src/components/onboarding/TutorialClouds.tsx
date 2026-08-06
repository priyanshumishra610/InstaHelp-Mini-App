import { MotiView } from "moti";
import { useMemo } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Circle, Ellipse } from "react-native-svg";

type CloudSpec = {
  top: number | `${number}%`;
  left?: number | `${number}%`;
  right?: number | `${number}%`;
  scale: number;
  delay: number;
  drift: number;
  duration: number;
  tint: "accent" | "rose" | "sky" | "mint" | "amber" | "cream";
  opacity: number;
};

const SKY_CLOUDS: CloudSpec[] = [
  { top: "6%", left: -24, scale: 1.15, delay: 0, drift: 14, duration: 5200, tint: "cream", opacity: 0.92 },
  { top: "12%", right: -18, scale: 0.95, delay: 400, drift: -12, duration: 6100, tint: "sky", opacity: 0.78 },
  { top: "22%", left: "18%", scale: 0.72, delay: 180, drift: 10, duration: 4800, tint: "accent", opacity: 0.55 },
  { top: "8%", left: "42%", scale: 0.55, delay: 700, drift: -8, duration: 5600, tint: "rose", opacity: 0.5 },
  { top: "28%", right: "12%", scale: 0.68, delay: 260, drift: 11, duration: 6400, tint: "mint", opacity: 0.48 },
  { top: "18%", left: "62%", scale: 0.5, delay: 520, drift: -9, duration: 5000, tint: "amber", opacity: 0.45 },
];

const PANEL_CLOUDS: CloudSpec[] = [
  { top: -10, left: -16, scale: 0.42, delay: 0, drift: 6, duration: 3600, tint: "accent", opacity: 0.55 },
  { top: -6, right: -14, scale: 0.36, delay: 220, drift: -5, duration: 4000, tint: "sky", opacity: 0.5 },
  { top: 18, right: 8, scale: 0.28, delay: 140, drift: 4, duration: 3200, tint: "rose", opacity: 0.4 },
];

const TINTS = {
  cream: "#FFF8EE",
  rose: "#FECACA",
  sky: "#BAE6FD",
  mint: "#A7F3D0",
  amber: "#FDE68A",
} as const;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function softAccent(accent: string, mix = 0.28) {
  try {
    const { r, g, b } = hexToRgb(accent);
    const blend = (c: number) => Math.round(c * mix + 255 * (1 - mix));
    return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
  } catch {
    return TINTS.cream;
  }
}

function CloudShape({
  fill,
  width = 120,
  height = 58,
  opacity = 1,
}: {
  fill: string;
  width?: number;
  height?: number;
  opacity?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 58">
      <Circle cx="28" cy="36" r="20" fill={fill} opacity={opacity} />
      <Circle cx="52" cy="26" r="24" fill={fill} opacity={opacity} />
      <Circle cx="78" cy="30" r="18" fill={fill} opacity={opacity} />
      <Circle cx="96" cy="38" r="14" fill={fill} opacity={opacity} />
      <Ellipse cx="58" cy="44" rx="50" ry="14" fill={fill} opacity={opacity} />
    </Svg>
  );
}

type Props = {
  accent?: string;
  variant?: "sky" | "panel";
  style?: ViewStyle;
};

/** Soft drifting clouds for tutorial scenes — tinted by step accent. */
export function TutorialClouds({
  accent = "#2563EB",
  variant = "sky",
  style,
}: Props) {
  const clouds = variant === "panel" ? PANEL_CLOUDS : SKY_CLOUDS;
  const accentFill = useMemo(() => softAccent(accent, 0.32), [accent]);

  const fillFor = (tint: CloudSpec["tint"]) => {
    if (tint === "accent") return accentFill;
    return TINTS[tint];
  };

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        variant === "panel" && styles.wrapPanel,
        variant === "sky" && styles.wrapSky,
        style,
      ]}
    >
      {variant === "sky" ? (
        <View
          style={[
            styles.skyWash,
            { backgroundColor: softAccent(accent, 0.06) },
          ]}
        />
      ) : null}

      {clouds.map((cloud, index) => {
        const fill = fillFor(cloud.tint);
        const w = Math.round(120 * cloud.scale);
        const h = Math.round(58 * cloud.scale);
        return (
          <MotiView
            key={`${variant}-${index}`}
            from={{
              opacity: 0,
              translateX: cloud.drift > 0 ? -10 : 10,
              translateY: 6,
            }}
            animate={{
              opacity: cloud.opacity,
              translateX: [0, cloud.drift, 0],
              translateY: [0, -6, 0],
            }}
            transition={{
              type: "timing",
              duration: cloud.duration,
              delay: cloud.delay,
              loop: true,
            }}
            style={[
              styles.cloud,
              {
                top: cloud.top,
                left: cloud.left,
                right: cloud.right,
                width: w,
                height: h,
              },
            ]}
          >
            <CloudShape fill={fill} width={w} height={h} opacity={1} />
            {/* Soft colored underglow for depth */}
            <View
              style={[
                styles.glow,
                {
                  backgroundColor: fill,
                  width: w * 0.7,
                  height: h * 0.35,
                },
              ]}
            />
          </MotiView>
        );
      })}

      {variant === "sky" ? (
        <>
          <MotiView
            from={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.05, 0.92] }}
            transition={{ type: "timing", duration: 2800, loop: true }}
            style={[styles.orb, styles.orbA, { backgroundColor: softAccent(accent, 0.45) }]}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.08, 1] }}
            transition={{ type: "timing", duration: 3400, delay: 400, loop: true }}
            style={[styles.orb, styles.orbB, { backgroundColor: TINTS.rose }]}
          />
          <MotiView
            from={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.1, 0.95] }}
            transition={{ type: "timing", duration: 3000, delay: 200, loop: true }}
            style={[styles.orb, styles.orbC, { backgroundColor: TINTS.mint }]}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  wrapPanel: {
    bottom: undefined,
    height: 78,
  },
  wrapSky: {
    bottom: undefined,
    height: "28%",
    maxHeight: 220,
  },
  skyWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
  },
  cloud: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  glow: {
    position: "absolute",
    bottom: 4,
    borderRadius: 999,
    opacity: 0.28,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbA: {
    width: 18,
    height: 18,
    top: "16%",
    left: "8%",
  },
  orbB: {
    width: 12,
    height: 12,
    top: "10%",
    right: "22%",
  },
  orbC: {
    width: 14,
    height: 14,
    top: "26%",
    right: "8%",
  },
});
