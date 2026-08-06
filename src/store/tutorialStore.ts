import {
  IN_APP_TUTORIAL_STEPS,
  type InAppTutorialStep,
} from "@/constants/inAppTutorialSteps";
import { useOnboardingStore } from "@/store/onboardingStore";
import { create } from "zustand";

export type TutorialTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TutorialState = {
  active: boolean;
  stepIndex: number;
  targets: Record<string, TutorialTargetRect>;
  registerTarget: (id: string, rect: TutorialTargetRect) => void;
  unregisterTarget: (id: string) => void;
  startTutorial: () => void;
  nextStep: () => void;
  advanceOnTarget: (targetId: string) => void;
  skipTutorial: () => void;
  finishTutorial: () => void;
  getCurrentStep: () => InAppTutorialStep | null;
  isTargetForCurrentStep: (targetId: string) => boolean;
};

function completeOnboardingFlag() {
  useOnboardingStore.getState().completeAppTutorial();
  useOnboardingStore.getState().setPendingInAppTutorial(false);
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  active: false,
  stepIndex: 0,
  targets: {},

  registerTarget: (id, rect) => {
    const prev = get().targets[id];
    if (
      prev &&
      Math.abs(prev.x - rect.x) <= 1 &&
      Math.abs(prev.y - rect.y) <= 1 &&
      Math.abs(prev.width - rect.width) <= 1 &&
      Math.abs(prev.height - rect.height) <= 1
    ) {
      return;
    }
    set((s) => ({
      targets: { ...s.targets, [id]: rect },
    }));
  },

  unregisterTarget: (id) => {
    set((s) => {
      const next = { ...s.targets };
      delete next[id];
      return { targets: next };
    });
  },

  startTutorial: () => {
    set({ active: true, stepIndex: 0, targets: {} });
  },

  nextStep: () => {
    const { stepIndex } = get();
    if (stepIndex >= IN_APP_TUTORIAL_STEPS.length - 1) {
      get().finishTutorial();
      return;
    }
    set({ stepIndex: stepIndex + 1 });
  },

  advanceOnTarget: (targetId) => {
    const step = get().getCurrentStep();
    if (!get().active || step?.targetId !== targetId) return;
    get().nextStep();
  },

  skipTutorial: () => {
    completeOnboardingFlag();
    set({ active: false, stepIndex: 0, targets: {} });
  },

  finishTutorial: () => {
    completeOnboardingFlag();
    set({ active: false, stepIndex: 0, targets: {} });
  },

  getCurrentStep: () => {
    const { stepIndex, active } = get();
    if (!active) return null;
    return IN_APP_TUTORIAL_STEPS[stepIndex] ?? null;
  },

  isTargetForCurrentStep: (targetId) => {
    const step = get().getCurrentStep();
    return Boolean(step?.targetId === targetId && step.action === "tap");
  },
}));
