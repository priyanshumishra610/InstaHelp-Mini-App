import type { TutorialTargetRect } from "@/store/tutorialStore";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export type ArrowSide = "above" | "below" | "left" | "right";

type Props = {
  target: TutorialTargetRect;
  side?: ArrowSide;
  accent?: string;
  label?: string;
};

const ARROW_SIZE = 44;
const GAP = 8;

/** Lightweight static pointer — no looping Moti animations. */
export function TutorialArrowPointer({
  target,
  side = "above",
  accent = "#E11D48",
  label = "Tap here",
}: Props) {
  const cx = target.x + target.width / 2;
  const cy = target.y + target.height / 2;

  const icon =
    side === "above"
      ? "arrow-down"
      : side === "below"
        ? "arrow-up"
        : side === "left"
          ? "arrow-forward"
          : "arrow-back";

  let left = cx - ARROW_SIZE / 2;
  let top = target.y - ARROW_SIZE - GAP;

  if (side === "below") {
    top = target.y + target.height + GAP;
  } else if (side === "left") {
    left = target.x - ARROW_SIZE - GAP;
    top = cy - ARROW_SIZE / 2;
  } else if (side === "right") {
    left = target.x + target.width + GAP;
    top = cy - ARROW_SIZE / 2;
  }

  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            left: target.x - 4,
            top: target.y - 4,
            width: target.width + 8,
            height: target.height + 8,
            borderColor: accent,
          },
        ]}
      />
      <View pointerEvents="none" style={[styles.arrowWrap, { left, top }]}>
        <View style={[styles.arrowBadge, { borderColor: accent }]}>
          <Ionicons name={icon} size={26} color={accent} />
        </View>
        <View style={[styles.tapLabel, { backgroundColor: accent }]}>
          <Text style={styles.tapLabelText}>{label}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderRadius: 16,
    borderWidth: 2.5,
    zIndex: 10000,
    elevation: 10000,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  arrowWrap: {
    position: "absolute",
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    zIndex: 10005,
    elevation: 10005,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBadge: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: ARROW_SIZE / 2,
    borderWidth: 2.5,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tapLabel: {
    position: "absolute",
    top: -20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    minWidth: 64,
    alignItems: "center",
  },
  tapLabelText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
