import { guidedTourProgressLabel } from "@/constants/guidedTourSteps";
import { AUTH_FONT } from "@/constants/authPremium";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onSkip: () => void;
  onNext: () => void;
  nextLabel?: string;
};

export function TourProgressHeader({
  onSkip,
  onNext,
  nextLabel = "Next",
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const stepIndex = useGuidedTourStore((s) => s.stepIndex);
  const label = guidedTourProgressLabel(stepIndex);

  if (!label) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      pointerEvents="auto"
      style={[styles.root, { top: insets.top + 8 }]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.surface,
            borderColor: colors.line,
          },
        ]}
      >
        <Text style={[styles.progress, { color: colors.inkMuted, fontFamily: AUTH_FONT.bold }]}>
          {label}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onSkip}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip tour"
          style={({ pressed }) => [
            styles.chip,
            { backgroundColor: colors.surface, borderColor: colors.line },
            pressed && styles.chipPressed,
          ]}
        >
          <Text
            style={[
              styles.chipLabel,
              { color: colors.inkMuted, fontFamily: AUTH_FONT.semibold },
            ]}
          >
            Skip
          </Text>
        </Pressable>
        <Pressable
          onPress={onNext}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={nextLabel}
          style={({ pressed }) => [
            styles.chip,
            styles.nextChip,
            { backgroundColor: colors.accent, borderColor: colors.accent },
            pressed && styles.chipPressed,
          ]}
        >
          <Text
            style={[
              styles.chipLabel,
              styles.nextLabel,
              { fontFamily: AUTH_FONT.bold },
            ]}
          >
            {nextLabel}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    pointerEvents: "auto",
  },
  pill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  progress: {
    fontSize: 12,
    letterSpacing: 0.4,
    fontVariant: ["tabular-nums"],
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  nextChip: {
    borderWidth: 0,
    paddingHorizontal: 16,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipLabel: {
    fontSize: 12,
  },
  nextLabel: {
    color: "#FFFFFF",
  },
});
