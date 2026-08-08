import { TutorialStickOnly } from "@/components/onboarding/TutorialGuideCharacter";
import type { InAppTutorialStep } from "@/constants/inAppTutorialSteps";
import type { GuidePose } from "@/components/onboarding/TutorialGuideCharacter";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  step: InAppTutorialStep;
  stepIndex: number;
  totalSteps: number;
  pose: GuidePose;
  comicFont?: string;
  titleFont?: string;
  bodyFont?: string;
  labelFont?: string;
  nextLabel: string;
  isLast: boolean;
  isWelcome: boolean;
  compact?: boolean;
  alignEnd?: boolean;
  alignCenter?: boolean;
  onNext: () => void;
  onSkip: () => void;
};

/** Clean coach card — static layout, system fonts only (readable without Poppins loaded). */
export function TutorialComicPanel({
  step,
  stepIndex,
  totalSteps,
  pose,
  nextLabel,
  isLast,
  isWelcome,
  compact = false,
  alignEnd = false,
  alignCenter = false,
  onNext,
  onSkip,
}: Props) {
  return (
    <View
      style={[
        styles.panel,
        compact && styles.panelCompact,
        alignEnd && styles.panelEnd,
        alignCenter && styles.panelCenter,
      ]}
    >
      <View style={styles.frame}>
        <View style={styles.topRow}>
          <Text style={[styles.stepLabel, { color: step.accent }]}>
            {stepIndex + 1}/{totalSteps}
          </Text>
          <Pressable onPress={onSkip} hitSlop={8} accessibilityRole="button">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.castRow}>
          <TutorialStickOnly
            pose={pose}
            scale={compact ? 0.55 : 0.68}
            cloudFill="#FFFFFF"
            cloudAccent={step.bubbleBg}
            animated={false}
          />
          <View style={styles.copyCol}>
            {isWelcome ? <Text style={styles.brand}>InstaHelp</Text> : null}
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.body} numberOfLines={compact ? 2 : 5}>
              {compact ? step.comicBubble : step.body}
            </Text>
            {step.tapHint ? (
              <View style={[styles.tapHint, { backgroundColor: step.bubbleBg }]}>
                <Ionicons name="hand-left-outline" size={12} color={step.accent} />
                <Text style={styles.tapHintText} numberOfLines={2}>
                  {step.tapHint}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Finish tour" : "Next step"}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: step.accent },
            pressed && styles.nextBtnPressed,
          ]}
        >
          <Text style={styles.nextLabel}>{nextLabel}</Text>
          <Ionicons
            name={isLast ? "checkmark" : isWelcome ? "play" : "arrow-forward"}
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignSelf: "flex-start",
    maxWidth: 320,
    marginHorizontal: 14,
  },
  panelCompact: {
    maxWidth: 300,
  },
  panelEnd: {
    alignSelf: "flex-end",
  },
  panelCenter: {
    alignSelf: "center",
  },
  frame: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  skip: {
    fontSize: 13,
    fontWeight: "600",
    color: "#78716C",
  },
  castRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  copyCol: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    fontSize: 13,
    fontWeight: "800",
    color: "#171717",
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: "#374151",
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tapHintText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 11,
  },
  nextBtnPressed: {
    opacity: 0.9,
  },
  nextLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});