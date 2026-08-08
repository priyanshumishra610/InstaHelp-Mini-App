import { GlowBorder } from "@/components/onboarding/guided/ui/GlowBorder";
import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { StyleSheet, View } from "react-native";

type Props = {
  onContinue: () => void;
};

export function CreditsStep({ onContinue }: Props) {
  const creditsRect = useGuidedTourStore((s) => s.anchors["tour-credits"]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <GlowBorder rect={creditsRect ?? null} visible radius={16} />
      <TourHintCard
        hint="Use credits to unlock premium requests and experiences"
        subtitle="Watch short ads in Credits to earn more when you need them."
        actionLabel="Next"
        onAction={onContinue}
        top={120}
        align="right"
      />
    </View>
  );
}
