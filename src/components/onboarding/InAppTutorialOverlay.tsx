import { TutorialComicPanel } from "@/components/onboarding/TutorialComicPanel";
import { TutorialArrowPointer } from "@/components/onboarding/TutorialArrowPointer";
import {
  IN_APP_TUTORIAL_STEPS,
  type TutorialPanelPlacement,
} from "@/constants/inAppTutorialSteps";
import { TAB_BAR_BASE_HEIGHT } from "@/constants/tabBar";
import {
  useTutorialStore,
  type TutorialTargetRect,
} from "@/store/tutorialStore";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOLE_PAD = 8;
const PANEL_MAX_H = 260;

type ResolvedPlacement = {
  vertical: "top" | "mid" | "bottom";
  horizontal: "left" | "center" | "right";
};

function parsePlacement(placement: TutorialPanelPlacement): ResolvedPlacement {
  const [vertical, horizontal] = placement.split("-") as [
    ResolvedPlacement["vertical"],
    ResolvedPlacement["horizontal"],
  ];
  return { vertical, horizontal };
}

function placementFromTarget(
  target: { x: number; y: number; width: number; height: number },
  windowW: number,
  windowH: number,
): ResolvedPlacement {
  const midX = target.x + target.width / 2;
  const midY = target.y + target.height / 2;
  const vertical: ResolvedPlacement["vertical"] =
    midY > windowH * 0.55 ? "top" : midY < windowH * 0.35 ? "bottom" : "mid";
  const horizontal: ResolvedPlacement["horizontal"] =
    midX < windowW * 0.4 ? "right" : midX > windowW * 0.6 ? "left" : "center";
  return { vertical, horizontal };
}

export function InAppTutorialOverlay() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const active = useTutorialStore((s) => s.active);
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const targets = useTutorialStore((s) => s.targets);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const skipTutorial = useTutorialStore((s) => s.skipTutorial);
  const finishTutorial = useTutorialStore((s) => s.finishTutorial);

  const step = IN_APP_TUTORIAL_STEPS[stepIndex];
  const target = useMemo(
    () => (step?.targetId ? expandTarget(targets[step.targetId]) : null),
    [step?.targetId, targets],
  );

  const windowH = Dimensions.get("window").height;
  const windowW = Dimensions.get("window").width;
  const bottomInset = Math.max(insets.bottom, 8);
  const tabClearance = TAB_BAR_BASE_HEIGHT + bottomInset + 12;

  const placement = useMemo((): ResolvedPlacement => {
    if (step?.panelPlacement) return parsePlacement(step.panelPlacement);
    if (target) return placementFromTarget(target, windowW, windowH);
    return { vertical: "bottom", horizontal: "center" };
  }, [step?.panelPlacement, target, windowH, windowW]);

  const dockTop = placement.vertical === "top";
  const dockMid = placement.vertical === "mid";
  const alignEnd = placement.horizontal === "right";
  const alignCenter = placement.horizontal === "center";

  const arrowSide = useMemo(() => {
    if (dockTop) return "above" as const;
    if (placement.vertical === "bottom") return "below" as const;
    if (target) {
      const midY = target.y + target.height / 2;
      return midY > windowH * 0.5 ? ("above" as const) : ("below" as const);
    }
    return "above" as const;
  }, [dockTop, placement.vertical, target, windowH]);

  useEffect(() => {
    if (!active || !step?.route) return;
    router.navigate(step.route);
  }, [active, step?.id, step?.route, router]);

  if (!active || !step) return null;

  const isWelcome = step.id === "welcome";
  const isLast = stepIndex === IN_APP_TUTORIAL_STEPS.length - 1;
  const isTapStep = step.action === "tap";
  const nextCta = isLast ? (step.nextLabel ?? "Finish") : (step.nextLabel ?? "Next");

  const onNext = () => {
    if (isLast) finishTutorial();
    else nextStep();
  };

  const dockStyle: ViewStyle = dockTop
    ? { top: insets.top + 10 }
    : dockMid
      ? {
          top: Math.max(
            insets.top + 24,
            Math.round((windowH - PANEL_MAX_H) / 2) - 20,
          ),
        }
      : { bottom: tabClearance };

  return (
    <View style={styles.root} pointerEvents="box-none">
      {target && isTapStep ? (
        <TutorialArrowPointer
          target={target}
          side={arrowSide}
          accent={step.accent}
          label="Tap here"
        />
      ) : null}

      <View style={[styles.comicDock, dockStyle]} pointerEvents="box-none">
        <TutorialComicPanel
          step={step}
          stepIndex={stepIndex}
          totalSteps={IN_APP_TUTORIAL_STEPS.length}
          pose={step.guidePose}
          nextLabel={nextCta}
          isLast={isLast}
          isWelcome={isWelcome}
          compact={isTapStep}
          alignEnd={alignEnd}
          alignCenter={alignCenter}
          onNext={onNext}
          onSkip={skipTutorial}
        />
      </View>
    </View>
  );
}

function expandTarget(target: TutorialTargetRect | undefined) {
  if (!target) return null;
  return {
    x: Math.max(0, target.x - HOLE_PAD),
    y: Math.max(0, target.y - HOLE_PAD),
    width: target.width + HOLE_PAD * 2,
    height: target.height + HOLE_PAD * 2,
  };
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  comicDock: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10002,
    elevation: 10002,
  },
});
