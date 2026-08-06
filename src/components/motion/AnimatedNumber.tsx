import { useEffect, useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

type Props = {
  value: number;
  className?: string;
  style?: StyleProp<TextStyle>;
  duration?: number;
};

/**
 * Count-up number — inspired by Motion-Primitives Animated Number.
 * @see https://motion-primitives.com/docs/animated-number
 */
export function AnimatedNumber({
  value,
  className,
  style,
  duration = 480,
}: Props) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const from = display;
    const to = value;
    if (from === to) return;
    const start = Date.now();
    let frame = 0;

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last painted value
  }, [duration, value]);

  return (
    <Text className={className} style={style}>
      {display}
    </Text>
  );
}
