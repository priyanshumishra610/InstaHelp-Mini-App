import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { useReduceMotion } from "@/components/onboarding/guided/hooks/useReduceMotion";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  onContinue: () => void;
};

const DEMO_TEXT = "I need a plumber tomorrow morning";

export function RequestFormStep({ onContinue }: Props) {
  const reduceMotion = useReduceMotion();
  const setTourFormDemoActive = useGuidedTourStore(
    (s) => s.setTourFormDemoActive,
  );

  useEffect(() => {
    setTourFormDemoActive(true);
    return () => setTourFormDemoActive(false);
  }, [setTourFormDemoActive]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <TourHintCard
        hint="Describe exactly what you need"
        subtitle={
          reduceMotion
            ? undefined
            : `Example: "${DEMO_TEXT}"`
        }
        actionLabel="Next"
        onAction={onContinue}
      />
    </View>
  );
}

export { DEMO_TEXT as TOUR_FORM_DEMO_TEXT };
