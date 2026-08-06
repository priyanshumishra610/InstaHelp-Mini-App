import { SPRING } from "@/constants/designSystem";
import { makeMutable, withSpring } from "react-native-reanimated";

const spring = {
  damping: SPRING.snappy.damping,
  stiffness: SPRING.snappy.stiffness,
  mass: SPRING.snappy.mass,
};

/** Shared sliding active-pill geometry (window coords → bar-local). */
export const glassPill = {
  x: makeMutable(0),
  y: makeMutable(4),
  w: makeMutable(0),
  h: makeMutable(0),
  opacity: makeMutable(0),
  barX: makeMutable(0),
  barY: makeMutable(0),
};

export function setGlassTabBarOrigin(windowX: number, windowY: number) {
  glassPill.barX.value = windowX;
  glassPill.barY.value = windowY;
}

export function slideGlassPillTo(
  windowX: number,
  windowY: number,
  width: number,
  height: number,
) {
  glassPill.x.value = withSpring(windowX - glassPill.barX.value, spring);
  glassPill.y.value = withSpring(windowY - glassPill.barY.value, spring);
  glassPill.w.value = withSpring(width, spring);
  glassPill.h.value = withSpring(height, spring);
  glassPill.opacity.value = withSpring(1, spring);
}
