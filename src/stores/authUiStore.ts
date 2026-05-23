import { create } from "zustand";

/** Transient OTP UI state only — Firebase is source of truth for auth. */
type AuthUiState = {
  pendingPhoneDigits: string;
  resendSecondsLeft: number;
  setPendingPhoneDigits: (digits: string) => void;
  setResendSecondsLeft: (seconds: number) => void;
  resetOtpUi: () => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  pendingPhoneDigits: "",
  resendSecondsLeft: 0,
  setPendingPhoneDigits: (pendingPhoneDigits) => set({ pendingPhoneDigits }),
  setResendSecondsLeft: (resendSecondsLeft) => set({ resendSecondsLeft }),
  resetOtpUi: () => set({ pendingPhoneDigits: "", resendSecondsLeft: 0 }),
}));
