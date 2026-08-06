import { useColorScheme as useSystemColorScheme } from "react-native";

import {
  labelForAccent,
  labelForColorScheme,
  resolveThemeColors,
  type ResolvedThemeColors,
} from "@/constants/appearance";
import { useThemeStore } from "@/store/themeStore";

export type AppTheme = {
  colors: ResolvedThemeColors;
  isDark: boolean;
  colorSchemePreference: ReturnType<typeof useThemeStore.getState>["colorScheme"];
  accentId: ReturnType<typeof useThemeStore.getState>["accentId"];
  schemeLabel: string;
  accentLabel: string;
  setColorScheme: ReturnType<typeof useThemeStore.getState>["setColorScheme"];
  setAccentId: ReturnType<typeof useThemeStore.getState>["setAccentId"];
};

export function useAppTheme(): AppTheme {
  const colorSchemePreference = useThemeStore((s) => s.colorScheme);
  const accentId = useThemeStore((s) => s.accentId);
  const setColorScheme = useThemeStore((s) => s.setColorScheme);
  const setAccentId = useThemeStore((s) => s.setAccentId);
  const systemScheme = useSystemColorScheme();

  const isDark =
    colorSchemePreference === "dark" ||
    (colorSchemePreference === "system" && systemScheme === "dark");

  const colors = resolveThemeColors(accentId, isDark);

  return {
    colors,
    isDark,
    colorSchemePreference,
    accentId,
    schemeLabel: labelForColorScheme(colorSchemePreference),
    accentLabel: labelForAccent(accentId),
    setColorScheme,
    setAccentId,
  };
}
