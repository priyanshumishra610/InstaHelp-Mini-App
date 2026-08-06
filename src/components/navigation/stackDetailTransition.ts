import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

/** Smooth push when opening a vendor / detail card from the explore list. */
export const detailStackScreenOptions: NativeStackNavigationOptions = {
  animation: "slide_from_right",
  animationDuration: 380,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  customAnimationOnGesture: true,
};
