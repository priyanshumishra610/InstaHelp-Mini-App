import { MotiView } from "moti";
import { Children, type ReactNode, isValidElement } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  /** Stagger delay between children (ms). Motion-Primitives Animated Group. */
  delayChildren?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/**
 * Staggered entrance group — RN port of Motion-Primitives Animated Group.
 * @see https://motion-primitives.com/docs/animated-group
 */
export function AnimatedGroup({
  children,
  delayChildren = 45,
  style,
  className,
}: Props) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <View style={style} className={className}>
      {items.map((child, index) => (
        <MotiView
          key={child.key ?? index}
          from={{ opacity: 0, translateY: 10, scale: 0.96 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{
            type: "timing",
            duration: 320,
            delay: index * delayChildren,
          }}
        >
          {child}
        </MotiView>
      ))}
    </View>
  );
}
