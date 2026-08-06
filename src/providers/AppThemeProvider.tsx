import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useColorScheme as useNativeWindColorScheme, vars } from "nativewind";
import {
  useEffect,
  useMemo,
  type PropsWithChildren,
} from "react";
import { Appearance, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

/**
 * Syncs persisted appearance with NativeWind, navigation chrome, and system UI.
 * Defaults to a bright light canvas unless the user picks Dark / System.
 */
export function AppThemeProvider({ children }: PropsWithChildren) {
  const { colors, isDark, colorSchemePreference } = useAppTheme();
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    // NativeWind: force light unless user explicitly chose dark/system.
    if (colorSchemePreference === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(colorSchemePreference);
    }
  }, [colorSchemePreference, setColorScheme]);

  useEffect(() => {
    try {
      Appearance.setColorScheme(
        colorSchemePreference === "system" ? undefined : colorSchemePreference,
      );
    } catch {
      /* older runtimes may not support setColorScheme */
    }
  }, [colorSchemePreference]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.canvas).catch(() => {});
  }, [colors.canvas]);

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.canvas,
        card: colors.surface,
        text: colors.ink,
        border: colors.line,
        notification: colors.accent,
      },
    };
  }, [colors, isDark]);

  const cssVars = useMemo(
    () =>
      vars({
        "--color-accent": colors.channels.accent,
        "--color-accent-deep": colors.channels.accentDeep,
        "--color-accent-tint": colors.channels.accentTint,
        "--color-accent-soft": colors.channels.accentSoft,
        "--color-paper": colors.channels.paper,
        "--color-canvas": colors.channels.canvas,
        "--color-surface": colors.channels.surface,
        "--color-ink": colors.channels.ink,
        "--color-ink-muted": colors.channels.inkMuted,
        "--color-line": colors.channels.line,
      }),
    [colors.channels],
  );

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={[{ flex: 1, backgroundColor: colors.canvas }, cssVars]} className="flex-1">
        <StatusBar style={isDark ? "light" : "dark"} />
        {children}
      </View>
    </ThemeProvider>
  );
}
