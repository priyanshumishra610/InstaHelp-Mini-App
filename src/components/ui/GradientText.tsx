import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps, ReactNode } from "react";
import {
  Text,
  type StyleProp,
  type TextStyle,
} from "react-native";

type GradientColors = ComponentProps<typeof LinearGradient>["colors"];

type Props = {
  /** The text to render with gradient fill. */
  children: ReactNode;
  /** Two or more colors that form the gradient. */
  colors: GradientColors;
  /** Gradient start point, defaults to top-left. */
  start?: { x: number; y: number };
  /** Gradient end point, defaults to bottom-right. */
  end?: { x: number; y: number };
  /** Text style applied to BOTH the mask and the (hidden) sizing copy. */
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Renders text filled by a linear gradient using a MaskedView + LinearGradient.
 *
 * Implementation notes:
 *  - `maskElement` is the visible-text shape used as a luminance mask.
 *  - The gradient renders behind, clipped by that mask.
 *  - A second copy of the text inside the gradient (with opacity 0) ensures
 *    the gradient measures to the exact text dimensions.
 */
export function GradientText({
  children,
  colors,
  start = { x: 0, y: 0.5 },
  end = { x: 1, y: 0.5 },
  textStyle,
}: Props) {
  return (
    <MaskedView
      maskElement={
        <Text style={[{ backgroundColor: "transparent" }, textStyle]}>
          {children}
        </Text>
      }
    >
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[textStyle, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
