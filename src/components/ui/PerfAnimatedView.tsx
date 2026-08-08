import { PERF_MODE } from "@/constants/performance";
import type { ComponentProps } from "react";
import { View, type ViewProps } from "react-native";
import Animated from "react-native-reanimated";

type AnimatedViewProps = ComponentProps<typeof Animated.View>;

/** Plain View in perf mode; Reanimated View with entrance/exit otherwise. */
export function PerfAnimatedView({
  entering,
  exiting,
  layout,
  ...rest
}: AnimatedViewProps) {
  if (PERF_MODE) {
    return <View {...(rest as ViewProps)} />;
  }
  return (
    <Animated.View entering={entering} exiting={exiting} layout={layout} {...rest} />
  );
}
