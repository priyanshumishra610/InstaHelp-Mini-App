import { DraggableFab } from "@/components/home/DraggableFab";
import { AUTH_FONT } from "@/constants/authPremium";
import { useTutorialStore } from "@/store/tutorialStore";
import { Platform, StyleSheet, Text, View } from "react-native";

const TUTORIAL_TARGET = "new-request-fab";

type Props = {
  onPress: () => void;
  offsetTabBar?: boolean;
};

/** Floating entry to the concierge request form (home). Drag to reposition. */
export function RequestFormFab({ onPress, offsetTabBar = true }: Props) {
  const handlePress = () => {
    useTutorialStore.getState().advanceOnTarget(TUTORIAL_TARGET);
    onPress();
  };

  return (
    <DraggableFab
      id="new-request"
      tutorialId={TUTORIAL_TARGET}
      defaultAnchor="bottom-left"
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
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 13,
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
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 0.15,
  },
});
