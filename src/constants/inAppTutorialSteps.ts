import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Ionicons } from "@expo/vector-icons";
import type { GuidePose } from "@/components/onboarding/TutorialGuideCharacter";

export type TutorialStepAction = "next" | "tap";

/** Where the coach card sits so the highlighted control stays free to tap. */
export type TutorialPanelPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "mid-left"
  | "mid-center"
  | "mid-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type TutorialIntroPerk = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

export type InAppTutorialStep = {
  id: string;
  targetId?: string;
  route?:
    | "/(tabs)"
    | "/(tabs)/experiences"
    | "/(tabs)/shop"
    | "/(tabs)/profile"
    | "/(tabs)/vendors/arcade"
    | "/(tabs)/vendors/plans";
  comicBubble: string;
  title: string;
  body: string;
  accent: string;
  bubbleBg: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  action: TutorialStepAction;
  tapHint?: string;
  guidePose: GuidePose;
  /** Show InstaHelp wordmark and tagline on this step. */
  showBrand?: boolean;
  /** Short perk chips shown on the welcome step. */
  introPerks?: TutorialIntroPerk[];
  /** Override the Next button label. */
  nextLabel?: string;
  /** Fixed coach-card anchor for this step. */
  panelPlacement?: TutorialPanelPlacement;
};

export const IN_APP_TUTORIAL_STEPS: InAppTutorialStep[] = [
  {
    id: "welcome",
    showBrand: true,
    route: "/(tabs)",
    comicBubble: "Yo! I'm Stick. Ready for a 60-second adventure?",
    title: "Meet InstaHelp",
    body: "Your everyday concierge — home help, getaways, deals, and real humans on WhatsApp when you need them. Less stress, more life.",
    accent: "#E11D48",
    bubbleBg: "#FFF1F2",
    icon: "human-greeting-variant",
    action: "next",
    guidePose: "wave",
    nextLabel: "Let's roll",
    panelPlacement: "mid-center",
    introPerks: [
      { icon: "home-outline", label: "Home help" },
      { icon: "airplane-outline", label: "Getaways" },
      { icon: "bag-handle-outline", label: "Shop deals" },
      { icon: "chatbubble-ellipses-outline", label: "Concierge" },
    ],
  },
  {
    id: "new-request",
    targetId: "new-request-fab",
    route: "/(tabs)",
    comicBubble: "This button is the whole vibe. Tap it!",
    title: "New request",
    body: "Cleaning, repairs, errands — tell us once and InstaHelp routes it to the right pro.",
    accent: "#2563EB",
    bubbleBg: "#EFF6FF",
    icon: "clipboard-text-outline",
    action: "tap",
    tapHint: "Tap the glowing button to try it, or Next to continue",
    guidePose: "point-down",
    // FAB is bottom-left — keep card up and to the right
    panelPlacement: "top-right",
  },
  {
    id: "sort-filter",
    targetId: "sort-filter-fab",
    route: "/(tabs)",
    comicBubble: "4,500+ vendors? Filters to the rescue!",
    title: "Sort and filter",
    body: "Slice the list by category, distance, and credits until you find your perfect match.",
    accent: "#7C3AED",
    bubbleBg: "#F5F3FF",
    icon: "tune-variant",
    action: "tap",
    tapHint: "Tap Sort & Filter to try it, or Next to keep going",
    guidePose: "point-down",
    // FAB is bottom-right — keep card up and to the left
    panelPlacement: "top-left",
  },
  {
    id: "tab-experiences",
    targetId: "tab-experiences",
    route: "/(tabs)",
    comicBubble: "Paradise lives in this tab!",
    title: "Experiences",
    body: "Resorts, trips, and quick itineraries — book through your InstaHelp concierge.",
    accent: "#059669",
    bubbleBg: "#ECFDF5",
    icon: "palm-tree",
    action: "tap",
    tapHint: "Peek at Experiences, or Next to continue",
    guidePose: "point-tab",
    // Tab bar bottom — card sits upper-center
    panelPlacement: "top-center",
  },
  {
    id: "tab-shop",
    targetId: "tab-shop",
    route: "/(tabs)/experiences",
    comicBubble: "Deals, gift cards, curated picks!",
    title: "Shop",
    body: "Gift cards, affiliate steals, and handpicked stores — all in one swipe.",
    accent: "#D97706",
    bubbleBg: "#FFFBEB",
    icon: "shopping-outline",
    action: "tap",
    tapHint: "Browse Shop, or tap Next",
    guidePose: "point-tab",
    panelPlacement: "top-left",
  },
  {
    id: "tab-profile",
    targetId: "tab-profile",
    route: "/(tabs)/shop",
    comicBubble: "Your command center is here!",
    title: "Profile",
    body: "Bookings, addresses, favorites, settings — and replay this tour anytime.",
    accent: "#DB2777",
    bubbleBg: "#FDF2F8",
    icon: "account-circle-outline",
    action: "tap",
    tapHint: "Open Profile, or almost done — hit Next",
    guidePose: "point-tab",
    panelPlacement: "top-right",
  },
  {
    id: "finish",
    route: "/(tabs)/profile",
    comicBubble: "You crushed it. Go explore!",
    title: "You're all set",
    body: "InstaHelp has your back — browse vendors, book getaways, and replay this tour from Profile anytime.",
    accent: "#171717",
    bubbleBg: "#FFF9E6",
    icon: "check-decagram",
    action: "next",
    guidePose: "celebrate",
    nextLabel: "Start exploring",
    panelPlacement: "mid-center",
  },
];
