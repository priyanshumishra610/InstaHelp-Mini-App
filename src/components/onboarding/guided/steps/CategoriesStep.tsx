import { TourHintCard } from "@/components/onboarding/guided/ui/TourHintCard";
import { useReduceMotion } from "@/components/onboarding/guided/hooks/useReduceMotion";
import { useGuidedTourStore } from "@/store/guidedTourStore";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";

type Props = {
  onContinue: () => void;
};

const CATEGORY_ANCHORS = [
  "tour-category-0",
  "tour-category-1",
  "tour-category-2",
] as const;

function CategoryBounce({ anchorId, delay }: { anchorId: string; delay: number }) {
  const rect = useGuidedTourStore((s) => s.anchors[anchorId]);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.04, { damping: 8, stiffness: 320 }),
        withSpring(1, { damping: 12, stiffness: 260 }),
      ),
    );
  }, [delay, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!rect) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.highlight,
        {
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
        },
        style,
      ]}
    />
  );
}

export function CategoriesStep({ onContinue }: Props) {
  const reduceMotion = useReduceMotion();
  const setCategoryBounceIndex = useGuidedTourStore(
    (s) => s.setCategoryBounceIndex,
  );

  useEffect(() => {
    if (reduceMotion) return;
    const timers = CATEGORY_ANCHORS.map((_, i) =>
      setTimeout(() => setCategoryBounceIndex(i), 400 + i * 520),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion, setCategoryBounceIndex]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {!reduceMotion
        ? CATEGORY_ANCHORS.map((id, i) => (
            <CategoryBounce key={id} anchorId={id} delay={400 + i * 520} />
          ))
        : null}
      <TourHintCard
        hint="Browse services by category"
        subtitle="Swipe the list anytime. No pressure to tap."
        actionLabel="Next"
        onAction={onContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(23,23,23,0.12)",
    backgroundColor: "rgba(23,23,23,0.03)",
  },
});
