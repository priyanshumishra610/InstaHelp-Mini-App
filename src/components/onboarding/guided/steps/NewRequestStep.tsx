import { PulseRing } from "@/components/onboarding/guided/ui/PulseRing";
import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { StyleSheet, View } from "react-native";

type Props = {
  onContinue: () => void;
};

export function NewRequestStep({ onContinue }: Props) {
  const fabRect = useGuidedTourStore((s) => s.anchors["tour-new-request"]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <PulseRing rect={fabRect ?? null} />
      <TourHintCard
        hint="Need something specific?"
        subtitle="Create a custom request and nearby vendors can respond."
        actionLabel="Next"
        onAction={onContinue}
      />
    </View>
  );
}
