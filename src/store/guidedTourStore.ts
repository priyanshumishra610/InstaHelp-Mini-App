import {
  GUIDED_TOUR_STEPS,
  type GuidedTourStepId,
} from "@/constants/guidedTourSteps";
import { create } from "zustand";
import { useOnboardingStore } from "./onboardingStore";

export type TourAnchorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ScrollToVendorFn = () => void;

type GuidedTourState = {
  active: boolean;
  stepIndex: number;
  anchors: Record<string, TourAnchorRect>;
  tourSearchText: string;
  tourFormDemoActive: boolean;
  categoryBounceIndex: number;
  firstVendorGlow: boolean;
  scrollToVendor: ScrollToVendorFn | null;
  registerAnchor: (id: string, rect: TourAnchorRect) => void;
  unregisterAnchor: (id: string) => void;
  setTourSearchText: (text: string) => void;
  setTourFormDemoActive: (active: boolean) => void;
  setCategoryBounceIndex: (index: number) => void;
  setFirstVendorGlow: (on: boolean) => void;
  setScrollToVendor: (fn: ScrollToVendorFn | null) => void;
  startTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
};

function resetDemoFlags(): Pick<
  GuidedTourState,
  "tourSearchText" | "tourFormDemoActive" | "categoryBounceIndex" | "firstVendorGlow"
> {
  return {
    tourSearchText: "",
    tourFormDemoActive: false,
    categoryBounceIndex: -1,
    firstVendorGlow: false,
  };
}

function persistCompletion() {
  useOnboardingStore.getState().completeAppTutorial();
}

export const useGuidedTourStore = create<GuidedTourState>((set, get) => ({
  active: false,
  stepIndex: 0,
  anchors: {},
  tourSearchText: "",
  tourFormDemoActive: false,
  categoryBounceIndex: -1,
  firstVendorGlow: false,
  scrollToVendor: null,

  registerAnchor: (id, rect) => {
    const prev = get().anchors[id];
    if (
      prev &&
      prev.x === rect.x &&
      prev.y === rect.y &&
      prev.width === rect.width &&
      prev.height === rect.height
    ) {
      return;
    }
    set((s) => ({ anchors: { ...s.anchors, [id]: rect } }));
  },

  unregisterAnchor: (id) => {
    set((s) => {
      if (!s.anchors[id]) return s;
      const next = { ...s.anchors };
      delete next[id];
      return { anchors: next };
    });
  },

  setTourSearchText: (text) => set({ tourSearchText: text }),
  setTourFormDemoActive: (active) => set({ tourFormDemoActive: active }),
  setCategoryBounceIndex: (index) => set({ categoryBounceIndex: index }),
  setFirstVendorGlow: (on) => set({ firstVendorGlow: on }),
  setScrollToVendor: (fn) => set({ scrollToVendor: fn }),

  startTour: () =>
    set({
      active: true,
      stepIndex: 0,
      ...resetDemoFlags(),
    }),

  nextStep: () => {
    const { stepIndex, active } = get();
    if (!active) return;
    const next = stepIndex + 1;
    if (next >= GUIDED_TOUR_STEPS.length) {
      get().finishTour();
      return;
    }
    set({ stepIndex: next, ...resetDemoFlags() });
  },

  skipTour: () => {
    persistCompletion();
    set({ active: false, stepIndex: 0, ...resetDemoFlags() });
  },

  finishTour: () => {
    persistCompletion();
    set({ active: false, stepIndex: 0, ...resetDemoFlags() });
  },
}));

export function useGuidedTourStepId(): GuidedTourStepId {
  return useGuidedTourStore(
    (s) => GUIDED_TOUR_STEPS[s.stepIndex] ?? "welcome",
  );
}

export function isGuidedTourStep(stepId: GuidedTourStepId): boolean {
  const { active, stepIndex } = useGuidedTourStore.getState();
  if (!active) return false;
  return GUIDED_TOUR_STEPS[stepIndex] === stepId;
}
