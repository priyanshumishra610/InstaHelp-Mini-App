import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Text, View } from "react-native";

export type MiniGameWinTone = "accent" | "violet" | "emerald";

const TONES: Record<MiniGameWinTone, string> = {
  accent: "#7C3AED",
  violet: "#7c3aed",
  emerald: "#059669",
};

type Props = {
  show: boolean;
  tone?: MiniGameWinTone;
  /** Remount to replay enter animation (e.g. increment on each win). */
  burstKey: number;
  subline?: string;
};

/**
 * Full-bleed celebratory layer; `pointerEvents="none"` so taps pass through.
 */
export function MiniGameWinOverlay({
  show,
  tone = "accent",
  burstKey,
  subline,
}: Props) {
  if (!show) return null;

  const color = TONES[tone];

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      className="absolute inset-0 z-40 items-center justify-center"
      pointerEvents="none"
    >
      <View className="absolute inset-0 rounded-[inherit] bg-black/20" />

      <Animated.View
        key={burstKey}
        entering={ZoomIn.springify().damping(14).stiffness(240)}
        className="mx-6 items-center rounded-[28px] border-[2.5px] bg-white px-7 py-5 shadow-lg"
        style={{ borderColor: color, shadowColor: color }}
      >
        <Text style={{ fontSize: 54, lineHeight: 58 }}>🏆</Text>
        <Text
          className="mt-1 text-center text-[28px] font-black tracking-tight"
          style={{ color }}
        >
          You win
        </Text>
        {subline ? (
          <Text className="mt-2 text-center text-[14px] font-bold text-neutral-600">
            {subline}
          </Text>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}
