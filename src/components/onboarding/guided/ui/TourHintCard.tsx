import { tourHintBottomInset } from "@/components/onboarding/guided/ui/tourChromeInsets";
import { AUTH_FONT } from "@/constants/authPremium";
import { useAppTheme } from "@/hooks/useAppTheme";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  hint: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  bottom?: number;
  top?: number;
  align?: "center" | "left" | "right";
  entering?: boolean;
};

export function TourHintCard({
  hint,
  subtitle,
  actionLabel = "Next",
  onAction,
  bottom,
  top,
  align = "center",
  entering = true,
}: Props) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const resolvedBottom = bottom ?? tourHintBottomInset(insets.bottom);

  const content = (
    <View
      style={[
        styles.card,
        {
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.65)",
          alignSelf:
            align === "left"
              ? "flex-start"
              : align === "right"
                ? "flex-end"
                : "center",
        },
      ]}
    >
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={isDark ? 48 : 72}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(28,25,23,0.92)"
                : "rgba(255,255,255,0.94)",
            },
          ]}
        />
      )}
      <View style={styles.inner}>
        <Text style={[styles.hint, { color: colors.ink, fontFamily: AUTH_FONT.semibold }]}>
          {hint}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.inkMuted, fontFamily: AUTH_FONT.regular }]}>
            {subtitle}
          </Text>
        ) : null}
        {onAction ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: colors.accent },
              pressed && styles.actionPressed,
            ]}
          >
            <Text style={[styles.actionLabel, { fontFamily: AUTH_FONT.bold }]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (!entering) return content;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(280)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="auto"
      style={[styles.wrap, top != null ? { top } : { bottom: resolvedBottom }]}
    >
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 50,
    pointerEvents: "auto",
  },
  card: {
    maxWidth: 420,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#0C0A09",
        shadowOpacity: 0.12,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  inner: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  action: {
    marginTop: 4,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    letterSpacing: 0.1,
  },
});
