import { GlowBorder } from "@/components/onboarding/guided/ui/GlowBorder";
import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { StyleSheet, View } from "react-native";

type Props = {
  onContinue: () => void;
};

export function ProfileBookmarksStep({ onContinue }: Props) {
  const favoritesRect = useGuidedTourStore(
    (s) => s.anchors["tour-profile-favorites"],
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <GlowBorder rect={favoritesRect ?? null} visible radius={18} />
      <TourHintCard
        hint="Save vendors for later"
        subtitle="Bookmark services you book most often from Profile."
        actionLabel="Next"
        onAction={onContinue}
      />
    </View>
  );
}
