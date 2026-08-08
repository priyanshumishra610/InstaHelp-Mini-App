import { CategoriesStep } from "@/components/onboarding/guided/steps/CategoriesStep";
import { CompleteStep } from "@/components/onboarding/guided/steps/CompleteStep";
import { CreditsStep } from "@/components/onboarding/guided/steps/CreditsStep";
import { NewRequestStep } from "@/components/onboarding/guided/steps/NewRequestStep";
import { ProfileBookmarksStep } from "@/components/onboarding/guided/steps/ProfileBookmarksStep";
import { RequestFormStep } from "@/components/onboarding/guided/steps/RequestFormStep";
import { SearchDemoStep } from "@/components/onboarding/guided/steps/SearchDemoStep";
import { VendorsStep } from "@/components/onboarding/guided/steps/VendorsStep";
import { WelcomeStep } from "@/components/onboarding/guided/steps/WelcomeStep";
import { TourProgressHeader } from "@/components/onboarding/guided/ui/TourProgressHeader";
import { guidedTourStepId } from "@/constants/guidedTourSteps";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";

/** Premium interactive walkthrough — no scrims, no blocking overlays. */
export function GuidedTourOverlay() {
  const active = useGuidedTourStore((s) => s.active);
  const stepIndex = useGuidedTourStore((s) => s.stepIndex);
  const nextStep = useGuidedTourStore((s) => s.nextStep);
  const skipTour = useGuidedTourStore((s) => s.skipTour);
  const finishTour = useGuidedTourStore((s) => s.finishTour);
  const setTourFormDemoActive = useGuidedTourStore(
    (s) => s.setTourFormDemoActive,
  );

  const stepId = guidedTourStepId(stepIndex);

  const goNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  useEffect(() => {
    if (!active) return;

    if (stepId === "profile-bookmarks") {
      router.navigate("/(tabs)/profile");
      return;
    }

    if (
      stepId === "welcome" ||
      stepId === "search" ||
      stepId === "categories" ||
      stepId === "vendors" ||
      stepId === "new-request" ||
      stepId === "request-form" ||
      stepId === "credits"
    ) {
      router.navigate("/(tabs)");
    }
  }, [active, stepId]);

  useEffect(() => {
    if (!active) return;
    if (stepId === "request-form") {
      setTourFormDemoActive(true);
      return;
    }
    setTourFormDemoActive(false);
  }, [active, stepId, setTourFormDemoActive]);

  if (!active) return null;

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {stepId !== "complete" ? (
        <TourProgressHeader
          onSkip={skipTour}
          onNext={goNext}
          nextLabel={stepId === "welcome" ? "Start" : "Next"}
        />
      ) : null}

      {stepId === "welcome" ? (
        <WelcomeStep onStart={goNext} />
      ) : null}
      {stepId === "search" ? <SearchDemoStep onContinue={goNext} /> : null}
      {stepId === "categories" ? <CategoriesStep onContinue={goNext} /> : null}
      {stepId === "vendors" ? <VendorsStep onContinue={goNext} /> : null}
      {stepId === "new-request" ? <NewRequestStep onContinue={goNext} /> : null}
      {stepId === "request-form" ? (
        <RequestFormStep onContinue={goNext} />
      ) : null}
      {stepId === "credits" ? <CreditsStep onContinue={goNext} /> : null}
      {stepId === "profile-bookmarks" ? (
        <ProfileBookmarksStep onContinue={goNext} />
      ) : null}
      {stepId === "complete" ? <CompleteStep onFinish={finishTour} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
});
