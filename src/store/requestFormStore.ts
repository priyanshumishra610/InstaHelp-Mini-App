import { create } from "zustand";

type OpenOptions = {
  service?: string;
  source?: string;
  description?: string;
};

type RequestFormState = {
  visible: boolean;
  initialService?: string;
  initialSource?: string;
  initialDescription?: string;
  open: (opts?: OpenOptions) => void;
  close: () => void;
};

export const useRequestFormStore = create<RequestFormState>((set) => ({
  visible: false,
  initialService: undefined,
  initialSource: undefined,
  initialDescription: undefined,
  open: (opts) =>
    set({
      visible: true,
      initialService: opts?.service,
      initialSource: opts?.source,
      initialDescription: opts?.description,
    }),
  close: () =>
    set({
      visible: false,
      initialService: undefined,
      initialSource: undefined,
      initialDescription: undefined,
    }),
}));
