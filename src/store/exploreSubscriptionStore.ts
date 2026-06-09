import type { ExploreSubscription } from "@/types/exploreSubscription";
import { create } from "zustand";

type ExploreSubscriptionState = {
  subscription: ExploreSubscription | null;
  loading: boolean;
  lastFetchedPhone: string | null;
  setSubscription: (sub: ExploreSubscription | null) => void;
  setLoading: (loading: boolean) => void;
  setLastFetchedPhone: (phone: string | null) => void;
  clear: () => void;
};

export const useExploreSubscriptionStore = create<ExploreSubscriptionState>((set) => ({
  subscription: null,
  loading: false,
  lastFetchedPhone: null,
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (loading) => set({ loading }),
  setLastFetchedPhone: (lastFetchedPhone) => set({ lastFetchedPhone }),
  clear: () =>
    set({ subscription: null, loading: false, lastFetchedPhone: null }),
}));
