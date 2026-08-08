import { tabBarOverlayHeight } from "@/constants/tabBar";

/** Clears floating tab bar when placing tour hint cards. */
export function tourHintBottomInset(bottomSafeInset: number): number {
  return tabBarOverlayHeight(bottomSafeInset) + 72;
}
