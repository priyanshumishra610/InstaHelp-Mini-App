import {
  ACCENT_PRESETS,
  COLOR_SCHEME_OPTIONS,
  type AccentId,
  type ColorSchemePreference,
} from "@/constants/appearance";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AppearanceSettingsModal({ open, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const {
    colors,
    isDark,
    colorSchemePreference,
    accentId,
    setColorScheme,
    setAccentId,
  } = useAppTheme();

  useEffect(() => {
    if (!open) return;
  }, [open]);

  const selectScheme = (next: ColorSchemePreference) => {
    void Haptics.selectionAsync();
    setColorScheme(next);
  };

  const selectAccent = (next: AccentId) => {
    void Haptics.selectionAsync();
    setAccentId(next);
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{ backgroundColor: colors.paper, paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
          <View className="min-w-0 flex-1 pr-3">
            <Text
              className="text-[22px] font-bold tracking-tight"
              style={{ color: colors.ink }}
            >
              Appearance
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.inkMuted }}>
              Theme mode and accent colour for the app
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close appearance settings"
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: isDark ? colors.surfaceMuted : "#FFFFFF" }}
          >
            <Ionicons name="close" size={20} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="mb-2.5 mt-2 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: colors.inkMuted }}
          >
            Theme
          </Text>
          <View
            className="overflow-hidden rounded-3xl border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.line,
              ...(Platform.OS === "ios"
                ? {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: isDark ? 0.2 : 0.05,
                    shadowRadius: 16,
                  }
                : { elevation: 3 }),
            }}
          >
            {COLOR_SCHEME_OPTIONS.map((option, index) => {
              const selected = colorSchemePreference === option.id;
              return (
                <View key={option.id}>
                  {index > 0 ? (
                    <View
                      className="mx-4 h-px"
                      style={{ backgroundColor: colors.lineLight }}
                    />
                  ) : null}
                  <Pressable
                    onPress={() => selectScheme(option.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${option.label} theme`}
                    className="flex-row items-center justify-between px-4 py-3.5 active:opacity-80"
                  >
                    <View className="min-w-0 flex-1 flex-row items-center gap-3">
                      <View
                        className="h-10 w-10 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: selected
                            ? colors.accentSoft
                            : isDark
                              ? colors.surfaceMuted
                              : colors.paper,
                        }}
                      >
                        <Ionicons
                          name={
                            option.id === "system"
                              ? "phone-portrait-outline"
                              : option.id === "light"
                                ? "sunny-outline"
                                : "moon-outline"
                          }
                          size={18}
                          color={selected ? colors.accent : colors.inkMuted}
                        />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text
                          className="text-[15px] font-semibold"
                          style={{ color: colors.ink }}
                        >
                          {option.label}
                        </Text>
                        <Text
                          className="mt-0.5 text-xs"
                          style={{ color: colors.inkMuted }}
                        >
                          {option.hint}
                        </Text>
                      </View>
                    </View>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.accent}
                      />
                    ) : (
                      <View
                        className="h-5 w-5 rounded-full border"
                        style={{ borderColor: colors.line }}
                      />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Text
            className="mb-2.5 mt-8 text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ color: colors.inkMuted }}
          >
            Accent colour
          </Text>
          <View
            className="rounded-3xl border px-4 py-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.line,
            }}
          >
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {ACCENT_PRESETS.map((preset) => {
                const selected = accentId === preset.id;
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => selectAccent(preset.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${preset.label} accent`}
                    className="w-[30%] items-center active:opacity-80"
                  >
                    <View
                      className="h-14 w-14 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: preset.accent,
                        borderWidth: selected ? 3 : 0,
                        borderColor: colors.ink,
                        shadowColor: preset.accent,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: selected ? 0.35 : 0.18,
                        shadowRadius: 10,
                        elevation: selected ? 6 : 3,
                      }}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={22}
                          color={preset.accentForeground}
                        />
                      ) : null}
                    </View>
                    <Text
                      className="mt-2 text-center text-xs font-medium"
                      style={{
                        color: selected ? colors.ink : colors.inkMuted,
                      }}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              className="mt-5 overflow-hidden rounded-2xl border px-4 py-3.5"
              style={{
                backgroundColor: isDark ? colors.surfaceMuted : colors.paper,
                borderColor: colors.line,
              }}
            >
              <Text
                className="text-[11px] font-bold uppercase tracking-[0.1em]"
                style={{ color: colors.inkMuted }}
              >
                Preview
              </Text>
              <Text
                className="mt-2 text-base font-semibold"
                style={{ color: colors.ink }}
              >
                Instant help, your way
              </Text>
              <View className="mt-3 flex-row gap-2">
                <View
                  className="rounded-full px-4 py-2.5"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: colors.accentForeground }}
                  >
                    Primary
                  </Text>
                </View>
                <View
                  className="rounded-full border px-4 py-2.5"
                  style={{ borderColor: colors.line }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.ink }}
                  >
                    Secondary
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
