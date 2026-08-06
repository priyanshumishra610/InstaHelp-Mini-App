import { MotiView } from "moti";
import { Text, type StyleProp, type TextStyle } from "react-native";

type Props = {
  children: string;
  className?: string;
  style?: StyleProp<TextStyle>;
  duration?: number;
  /** Kept for Motion-Primitives API parity */
  baseColor?: string;
  highlightColor?: string;
};

/**
 * Lightweight RN shimmer text — Motion-Primitives Text Shimmer inspired.
 * @see https://motion-primitives.com/docs/text-shimmer
 */
export function TextShimmer({
  children,
  className,
  style,
  duration = 2.2,
  highlightColor = "#0A0A0A",
}: Props) {
  return (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: duration * 500,
        loop: true,
      }}
    >
      <Text className={className} style={[{ color: highlightColor }, style]}>
        {children}
      </Text>
    </MotiView>
  );
}
