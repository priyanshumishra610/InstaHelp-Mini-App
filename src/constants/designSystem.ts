import { Platform, type ViewStyle } from "react-native";
import { ACCENT, ACCENT_DEEP, ACCENT_TINT, HERO_CANVAS, HERO_LAVENDER, HERO_LAVENDER_MIST, LAVENDER_GLOW, PAPER } from "./theme";

/** 8px grid spacing system */
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const RADIUS = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 26,
  xxl: 30,
  pill: 999,
} as const;

export const COLORS = {
  accent: ACCENT,
  accentDeep: ACCENT_DEEP,
  accentTint: ACCENT_TINT,
  accentSoft: "#F5F5F4",
  heroCanvas: HERO_CANVAS,
  heroLavender: HERO_LAVENDER,
  heroLavenderMist: HERO_LAVENDER_MIST,
  lavenderGlow: LAVENDER_GLOW,
  paper: PAPER,
  ink: "#1C1917",
  inkMuted: "#57534E",
  inkSubtle: "#A8A29E",
  line: "#E7E5E4",
  lineLight: "#F5F5F4",
  surface: "#FFFFFF",
  surfaceMuted: "#EEECE7",
  success: "#059669",
  successSoft: "#ECFDF5",
  gold: "#A16207",
  goldSoft: "#FEF9E7",
} as const;

/** Liquid glass — sparse live blur (tab bar + a few hero surfaces). */
export const GLASS = {
  blurLight: 36,
  blurMedium: 52,
  blurStrong: 68,
  /** Strong frosted capsule — pair with very low white wash */
  blurTab: 95,
  tint: "light" as const,
  fill: "rgba(255,255,255,0.55)",
  fillStrong: "rgba(255,255,255,0.72)",
  fillSoft: "rgba(255,255,255,0.4)",
  fillFallback: "rgba(255,255,255,0.94)",
  border: "rgba(255,255,255,0.55)",
  borderSoft: "rgba(255,255,255,0.5)",
  rim: "rgba(255,255,255,0.28)",
  stroke: "rgba(28,25,23,0.06)",
} as const;

type ShadowTier = "sm" | "md" | "lg" | "card" | "clay";

/**
 * Claymorphism-leaning soft extrusion + minimal card shadows.
 * Clay: soft dual-depth; Card: quieter elevation.
 */
export function cardShadow(tier: ShadowTier = "card"): ViewStyle {
  const presets: Record<ShadowTier, ViewStyle> = {
    sm: Platform.select({
      ios: {
        shadowColor: "#1C1917",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }) ?? {},
    md: Platform.select({
      ios: {
        shadowColor: "#1C1917",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
      default: {},
    }) ?? {},
    lg: Platform.select({
      ios: {
        shadowColor: "#1C1917",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.1,
        shadowRadius: 28,
      },
      android: { elevation: 7 },
      default: {},
    }) ?? {},
    card: Platform.select({
      ios: {
        shadowColor: "#1C1917",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: { elevation: 5 },
      default: {},
    }) ?? {},
    clay: Platform.select({
      ios: {
        shadowColor: "#78716C",
        shadowOffset: { width: 6, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
      default: {},
    }) ?? {},
  };
  return presets[tier];
}

/** Soft clay surface style for interactive cards */
export function claySurface(radius: number = RADIUS.xl): ViewStyle {
  return {
    borderRadius: radius,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
    borderTopColor: "rgba(255,255,255,1)",
    borderLeftColor: "rgba(255,255,255,1)",
    borderBottomColor: "rgba(231,229,228,0.9)",
    borderRightColor: "rgba(231,229,228,0.85)",
    ...cardShadow("clay"),
  };
}

export const SPRING = {
  gentle: { damping: 20, stiffness: 300, mass: 0.8 },
  snappy: { damping: 18, stiffness: 400, mass: 0.6 },
  bouncy: { damping: 14, stiffness: 280, mass: 0.9 },
} as const;
