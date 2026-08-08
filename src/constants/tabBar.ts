/** Tab bar content height — tight fit, no internal padding. */
export const TAB_BAR_BASE_HEIGHT = 58;

/** Icon size inside tab items. */
export const TAB_BAR_ICON_SIZE = 24;

/** Tab label typography. */
export const TAB_BAR_LABEL_SIZE = 11;
export const TAB_BAR_LABEL_LINE_HEIGHT = 13;

/** Horizontal inset for the floating glass bar. */
export const TAB_BAR_FLOAT_INSET = 16;

/** Gap between the bar and the bottom safe area. */
export const TAB_BAR_FLOAT_GAP = 7;

/** How far the center FAB rises above the bar top edge. */
export const TAB_BAR_FAB_OVERLAP = 14;

/** Center action button diameter. */
export const TAB_BAR_FAB_SIZE = 48;

/** Extra upward offset for the center + button above the bar. */
export const TAB_BAR_FAB_EXTRA_LIFT = 6;

/** Extra opaque cover height on Gift Cards (Hubble) to hide partner footer. */
export const TAB_BAR_HUBBLE_COVER_EXTRA = 28;

/** Distance from screen bottom to the top edge of the floating tab bar pill. */
export function tabBarTopOffset(safeBottom: number): number {
  return TAB_BAR_BASE_HEIGHT + Math.max(safeBottom, 4) + TAB_BAR_FLOAT_GAP;
}

/** Total vertical space the overlay occupies (for optional screen insets). */
export function tabBarOverlayHeight(safeBottom: number): number {
  return tabBarTopOffset(safeBottom) + TAB_BAR_FAB_OVERLAP;
}
