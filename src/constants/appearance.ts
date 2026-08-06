/** User-selectable appearance: color scheme + accent presets. */

export type ColorSchemePreference = "system" | "light" | "dark";

export type AccentId =
  | "classic"
  | "ocean"
  | "forest"
  | "crimson"
  | "amber"
  | "sapphire";

export type AccentPreset = {
  id: AccentId;
  label: string;
  /** Primary brand / CTA color */
  accent: string;
  accentDeep: string;
  accentTint: string;
  accentSoft: string;
  /** Readable text on accent fills */
  accentForeground: string;
};

export type ResolvedThemeColors = {
  accent: string;
  accentDeep: string;
  accentTint: string;
  accentSoft: string;
  accentForeground: string;
  paper: string;
  canvas: string;
  surface: string;
  surfaceMuted: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  line: string;
  lineLight: string;
  heroMist: string;
  /** RGB channel strings for NativeWind CSS variables */
  channels: {
    accent: string;
    accentDeep: string;
    accentTint: string;
    accentSoft: string;
    paper: string;
    canvas: string;
    surface: string;
    ink: string;
    inkMuted: string;
    line: string;
  };
};

export const ACCENT_PRESETS: readonly AccentPreset[] = [
  {
    id: "classic",
    label: "Classic",
    accent: "#171717",
    accentDeep: "#0C0A09",
    accentTint: "#E7E5E4",
    accentSoft: "#F5F5F4",
    accentForeground: "#FFFFFF",
  },
  {
    id: "ocean",
    label: "Ocean",
    accent: "#0F766E",
    accentDeep: "#115E59",
    accentTint: "#CCFBF1",
    accentSoft: "#F0FDFA",
    accentForeground: "#FFFFFF",
  },
  {
    id: "forest",
    label: "Forest",
    accent: "#166534",
    accentDeep: "#14532D",
    accentTint: "#DCFCE7",
    accentSoft: "#F0FDF4",
    accentForeground: "#FFFFFF",
  },
  {
    id: "crimson",
    label: "Crimson",
    accent: "#B91C1C",
    accentDeep: "#991B1B",
    accentTint: "#FEE2E2",
    accentSoft: "#FEF2F2",
    accentForeground: "#FFFFFF",
  },
  {
    id: "amber",
    label: "Amber",
    accent: "#B45309",
    accentDeep: "#92400E",
    accentTint: "#FDE68A",
    accentSoft: "#FFFBEB",
    accentForeground: "#FFFFFF",
  },
  {
    id: "sapphire",
    label: "Sapphire",
    accent: "#1D4ED8",
    accentDeep: "#1E3A8A",
    accentTint: "#DBEAFE",
    accentSoft: "#EFF6FF",
    accentForeground: "#FFFFFF",
  },
] as const;

export const DEFAULT_ACCENT_ID: AccentId = "classic";
/** Bright paper default — dark remains available in Appearance settings. */
export const DEFAULT_COLOR_SCHEME: ColorSchemePreference = "light";

export const COLOR_SCHEME_OPTIONS: {
  id: ColorSchemePreference;
  label: string;
  hint: string;
}[] = [
  { id: "system", label: "System", hint: "Match device" },
  { id: "light", label: "Light", hint: "Bright paper" },
  { id: "dark", label: "Dark", hint: "Low light" },
];

export function getAccentPreset(id: AccentId): AccentPreset {
  return ACCENT_PRESETS.find((p) => p.id === id) ?? ACCENT_PRESETS[0];
}

export function hexToRgbChannels(hex: string): string {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return "23 23 23";
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const LIGHT_SURFACES = {
  paper: "#F5F4F0",
  canvas: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceMuted: "#EEECE7",
  ink: "#1C1917",
  inkMuted: "#57534E",
  inkSubtle: "#A8A29E",
  line: "#E7E5E4",
  lineLight: "#F5F5F4",
  heroMist: "#F5F5F4",
} as const;

const DARK_SURFACES = {
  paper: "#1C1917",
  canvas: "#18181B",
  surface: "#27272A",
  surfaceMuted: "#3F3F46",
  ink: "#FAFAF9",
  inkMuted: "#D6D3D1",
  inkSubtle: "#A8A29E",
  line: "#52525B",
  lineLight: "#3F3F46",
  heroMist: "#27272A",
} as const;

export function resolveThemeColors(
  accentId: AccentId,
  isDark: boolean,
): ResolvedThemeColors {
  const preset = getAccentPreset(accentId);
  const surfaces = isDark ? DARK_SURFACES : LIGHT_SURFACES;
  const accentTint = isDark ? `${preset.accentDeep}` : preset.accentTint;
  const accentSoft = isDark ? surfaces.surfaceMuted : preset.accentSoft;

  return {
    accent: preset.accent,
    accentDeep: preset.accentDeep,
    accentTint: isDark ? "#292524" : accentTint,
    accentSoft,
    accentForeground: preset.accentForeground,
    ...surfaces,
    channels: {
      accent: hexToRgbChannels(preset.accent),
      accentDeep: hexToRgbChannels(preset.accentDeep),
      accentTint: hexToRgbChannels(isDark ? "#292524" : preset.accentTint),
      accentSoft: hexToRgbChannels(accentSoft),
      paper: hexToRgbChannels(surfaces.paper),
      canvas: hexToRgbChannels(surfaces.canvas),
      surface: hexToRgbChannels(surfaces.surface),
      ink: hexToRgbChannels(surfaces.ink),
      inkMuted: hexToRgbChannels(surfaces.inkMuted),
      line: hexToRgbChannels(surfaces.line),
    },
  };
}

export function labelForColorScheme(pref: ColorSchemePreference): string {
  return COLOR_SCHEME_OPTIONS.find((o) => o.id === pref)?.label ?? "System";
}

export function labelForAccent(id: AccentId): string {
  return getAccentPreset(id).label;
}
