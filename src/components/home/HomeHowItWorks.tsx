import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS } from "@/constants/designSystem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";

const STEPS = [
  {
    icon: "search" as const,
    title: "Search",
    subtitle: "Find the service you need",
  },
  {
    icon: "format-list-bulleted" as const,
    title: "Compare",
    subtitle: "Compare vendors, ratings & prices",
  },
  {
    icon: "calendar" as const,
    title: "Book",
    subtitle: "Book instantly and securely",
  },
  {
    icon: "checkCircle" as const,
    title: "Get It Done",
    subtitle: "Relax and get your work done",
  },
];

export function HomeHowItWorks() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { fontFamily: AUTH_FONT.bold, color: colors.ink }]}>
        How InstaHelp works?
      </Text>

      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => (
          <View key={step.title} style={styles.stepWrap}>
            <View style={styles.step}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.line,
                  },
                ]}
              >
                <AppIcon name={step.icon} size={20} color={colors.ink} />
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  { fontFamily: AUTH_FONT.semibold, color: colors.ink },
                ]}
              >
                {step.title}
              </Text>
              <Text
                style={[
                  styles.stepSub,
                  { fontFamily: AUTH_FONT.regular, color: colors.inkMuted },
                ]}
              >
                {step.subtitle}
              </Text>
            </View>

            {index < STEPS.length - 1 ? (
              <View style={styles.arrow}>
                <AppIcon name="chevronRight" size={14} color={colors.line} />
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heading: {
    fontSize: 20,
    letterSpacing: -0.35,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  step: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 11,
    textAlign: "center",
  },
  stepSub: {
    fontSize: 9,
    lineHeight: 12,
    textAlign: "center",
  },
  arrow: {
    paddingTop: 14,
    paddingHorizontal: 0,
    opacity: 0.7,
  },
});
