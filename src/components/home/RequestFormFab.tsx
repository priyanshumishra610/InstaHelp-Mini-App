import { DraggableFab } from "@/components/home/DraggableFab";
import { AUTH_FONT } from "@/constants/authPremium";
import { guidedTourStepId } from "@/constants/guidedTourSteps";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { Platform, StyleSheet, Text, View } from "react-native";

const TUTORIAL_TARGET = "tour-new-request";

type Props = {
  onPress: () => void;
  offsetTabBar?: boolean;
};

/** Floating entry to the concierge request form (home). Drag to reposition. */
export function RequestFormFab({ onPress, offsetTabBar = true }: Props) {
  const handlePress = () => {
    const store = useGuidedTourStore.getState();
    if (
      store.active &&
      guidedTourStepId(store.stepIndex) === "new-request"
    ) {
      store.nextStep();
    }
    onPress();
  };

  return (
    <DraggableFab
      id="new-request"
      tutorialId={TUTORIAL_TARGET}
      defaultAnchor="bottom-right"
      defaultLift={62}
      offsetTabBar={offsetTabBar}
      entranceDelayMs={220}
      accessibilityLabel="Start a new service request"
      onPress={handlePress}
    >
      <View style={styles.button} pointerEvents="none">
        <View style={styles.dot} />
        <Text style={[styles.label, { fontFamily: AUTH_FONT.semibold }]}>
          New request
        </Text>
      </View>
    </DraggableFab>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#171717",
    ...Platform.select({
      ios: {
        shadowColor: "#0C0A09",
        shadowOpacity: 0.22,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  label: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    letterSpacing: 0.15,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
