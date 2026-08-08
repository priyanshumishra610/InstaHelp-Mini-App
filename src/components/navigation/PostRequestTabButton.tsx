import { AppIcon } from "@/components/ui/AppIcon";
import { TourAnchor } from "@/components/onboarding/guided/TourAnchor";
import { AUTH_FONT } from "@/constants/authPremium";
import { TAB_BAR_FAB_EXTRA_LIFT, TAB_BAR_FAB_SIZE, TAB_BAR_ICON_SIZE, TAB_BAR_LABEL_LINE_HEIGHT, TAB_BAR_LABEL_SIZE } from "@/constants/tabBar";
import { guidedTourStepId } from "@/constants/guidedTourSteps";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { useRequestFormStore } from "@/store/requestFormStore";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

const FAB_YELLOW = "#FFCC00";
const FAB_LIFT = TAB_BAR_FAB_SIZE / 2 - TAB_BAR_ICON_SIZE / 2 + TAB_BAR_FAB_EXTRA_LIFT;

/** Center tab slot — elevated yellow FAB that opens the request form. */
export function PostRequestTabButton({
  onPress,
  accessibilityState,
  style,
  ...rest
}: BottomTabBarButtonProps) {
  const openForm = useRequestFormStore((s) => s.open);
  const [pressed, setPressed] = useState(false);

  const handlePress = (
    e: Parameters<NonNullable<BottomTabBarButtonProps["onPress"]>>[0],
  ) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const tour = useGuidedTourStore.getState();
    if (tour.active && guidedTourStepId(tour.stepIndex) === "new-request") {
      tour.nextStep();
    }
    openForm();
    onPress?.(e);
  };

  return (
    <PlatformPressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel="Start a new service request"
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.wrapper, style]}
    >
      <TourAnchor id="tour-new-request" style={styles.anchor}>
        <View style={styles.iconSlot}>
          <View style={[styles.fab, pressed && styles.fabPressed]}>
            <AppIcon name="add" size={26} color="#171717" />
          </View>
        </View>
        <Text style={[styles.label, { fontFamily: AUTH_FONT.regular }]}>
          New request
        </Text>
      </TourAnchor>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    margin: 0,
  },
  anchor: {
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    margin: 0,
  },
  iconSlot: {
    height: TAB_BAR_ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  fab: {
    width: TAB_BAR_FAB_SIZE,
    height: TAB_BAR_FAB_SIZE,
    borderRadius: TAB_BAR_FAB_SIZE / 2,
    marginTop: -FAB_LIFT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FAB_YELLOW,
    ...Platform.select({
      ios: {
        shadowColor: "#0C0A09",
        shadowOpacity: 0.14,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.92,
  },
  label: {
    fontSize: TAB_BAR_LABEL_SIZE,
    lineHeight: TAB_BAR_LABEL_LINE_HEIGHT,
    letterSpacing: 0.05,
    color: "#57534E",
    marginTop: 2,
    padding: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
