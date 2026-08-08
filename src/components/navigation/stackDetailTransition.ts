import { PERF_MODE } from "@/constants/performance";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

/** Smooth push when opening a vendor / detail card from the explore list. */
export const detailStackScreenOptions: NativeStackNavigationOptions = {
  animation: PERF_MODE ? "none" : "slide_from_right",
  animationDuration: PERF_MODE ? 0 : 100,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  customAnimationOnGesture: true,
};
