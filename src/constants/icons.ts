/**
 * Material Design 3–aligned semantic icon map.
 * Uses MaterialIcons / MaterialCommunityIcons via @expo/vector-icons.
 * @see https://m3.material.io/styles/icons/overview
 */
export const APP_ICONS = {
  // Tabs
  home: { filled: "home", outlined: "home-outline" },
  explore: { filled: "view-grid", outlined: "view-grid-outline" },
  experiences: { filled: "compass", outlined: "compass-outline" },
  shop: { filled: "shopping", outlined: "shopping-outline" },
  profile: { filled: "account", outlined: "account-outline" },

  // Common actions
  edit: "pencil-outline",
  camera: "camera",
  mail: "email-outline",
  phone: "phone-outline",
  location: "map-marker",
  calendar: "calendar-month",
  checkDone: "check-all",
  chevronRight: "chevron-right",
  arrowForward: "arrow-right",
  lock: "lock-outline",
  shield: "shield-check",
  star: "star",
  starOutline: "star-outline",
  heart: "heart",
  heartOutline: "heart-outline",
  rocket: "rocket-launch-outline",
  ribbon: "medal-outline",
  person: "account",
  whatsapp: "whatsapp",
  sparkles: "auto-fix",
  flash: "flash",
  water: "water",
  car: "car",
  package: "package-variant-closed",
  briefcase: "briefcase-outline",
  plane: "airplane",
  tool: "hammer-wrench",
  bug: "bug-outline",
  salon: "content-cut",
  empty: "inbox-outline",
  chat: "message-text",
  navigate: "navigation-variant-outline",
  copy: "content-copy",
  share: "share-variant-outline",
  settings: "cog-outline",
  search: "magnify",
  filter: "filter-variant",
  close: "close",
  add: "plus",
  bookmark: "bookmark",
  checkCircle: "check-circle",
  locate: "crosshairs-gps",
  info: "information-outline",
  compass: "compass-outline",
  diamond: "diamond-stone",
  refresh: "refresh",
} as const;

export type AppIconKey = keyof typeof APP_ICONS;
