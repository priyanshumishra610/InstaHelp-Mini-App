import { GlowBorder } from "@/components/onboarding/guided/ui/GlowBorder";
import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { useReduceMotion } from "@/components/onboarding/guided/hooks/useReduceMotion";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  onContinue: () => void;
};

export function VendorsStep({ onContinue }: Props) {
  const reduceMotion = useReduceMotion();
  const vendorRect = useGuidedTourStore((s) => s.anchors["tour-first-vendor"]);
  const scrollToVendor = useGuidedTourStore((s) => s.scrollToVendor);
  const setFirstVendorGlow = useGuidedTourStore((s) => s.setFirstVendorGlow);
  useEffect(() => {
    setFirstVendorGlow(true);
    const scrollTimer = setTimeout(() => {
      scrollToVendor?.();
    }, reduceMotion ? 80 : 320);
    return () => {
      clearTimeout(scrollTimer);
      setFirstVendorGlow(false);
    };
  }, [reduceMotion, scrollToVendor, setFirstVendorGlow]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <GlowBorder rect={vendorRect ?? null} visible radius={20} />
      <TourHintCard
        hint="View ratings, distance and pricing before choosing"
        actionLabel="Next"
        onAction={onContinue}
      />
    </View>
  );
}
