import { clerkErrorMessage } from "@/utils/auth/clerkErrors";
import { toE164Phone } from "@/utils/auth/phone";
import { syncClerkUserToProfile } from "@/utils/auth/syncClerkProfile";
import { useSignIn, useSignUp } from "@clerk/expo/legacy";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

type PhoneCodeFactor = { strategy: "phone_code"; phoneNumberId: string };

function isPhoneCodeFactor(
  factor: { strategy: string },
): factor is PhoneCodeFactor {
  return factor.strategy === "phone_code";
}

export function usePhoneOtp() {
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();

  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = signInLoaded && signUpLoaded;

  const sendCode = useCallback(
    async (rawPhone: string): Promise<boolean> => {
      if (!isReady) return false;
      setError(null);
      setLoading(true);
      const phoneNumber = toE164Phone(rawPhone);
      if (!phoneNumber || phoneNumber.length < 11) {
        setError("Enter a valid phone number");
        setLoading(false);
        return false;
      }

      try {
        try {
          const { supportedFirstFactors } = await signIn.create({
            identifier: phoneNumber,
          });
          const phoneCodeFactor = supportedFirstFactors?.find(
            isPhoneCodeFactor,
          ) as PhoneCodeFactor | undefined;
          if (!phoneCodeFactor?.phoneNumberId) {
            throw new Error("Phone sign-in is not enabled for this app");
          }
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: phoneCodeFactor.phoneNumberId,
          });
          setMode("signIn");
        } catch {
          await signUp.create({ phoneNumber });
          await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
          setMode("signUp");
        }

        setPendingPhone(phoneNumber);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return true;
      } catch (err) {
        setError(clerkErrorMessage(err, "Could not send verification code"));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isReady, signIn, signUp],
  );

  const verifyCode = useCallback(
    async (code: string) => {
      if (!isReady || !pendingPhone) return false;
      setError(null);
      setLoading(true);

      try {
        if (mode === "signUp") {
          const attempt = await signUp.attemptPhoneNumberVerification({ code });
          if (attempt.status === "complete" && attempt.createdSessionId) {
            await setActiveSignUp({ session: attempt.createdSessionId });
            syncClerkUserToProfile(null);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return true;
          }
        } else {
          const attempt = await signIn.attemptFirstFactor({
            strategy: "phone_code",
            code,
          });

          if (attempt.status === "complete" && attempt.createdSessionId) {
            await setActiveSignIn({ session: attempt.createdSessionId });
            syncClerkUserToProfile(null);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return true;
          }
        }

        setError("Verification incomplete. Try again.");
        return false;
      } catch (err) {
        setError(clerkErrorMessage(err, "Invalid or expired code"));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isReady, mode, pendingPhone, setActiveSignIn, setActiveSignUp, signIn, signUp],
  );

  const resendCode = useCallback(async () => {
    if (!pendingPhone || !isReady) return;
    setError(null);
    setLoading(true);
    try {
      if (signUp.status && signUp.status !== "complete") {
        await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      } else {
        const { supportedFirstFactors } = await signIn.create({
          identifier: pendingPhone,
        });
        const factor = supportedFirstFactors?.find(isPhoneCodeFactor) as
          | PhoneCodeFactor
          | undefined;
        if (factor?.phoneNumberId) {
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: factor.phoneNumberId,
          });
        }
      }
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      setError(clerkErrorMessage(err, "Could not resend code"));
    } finally {
      setLoading(false);
    }
  }, [isReady, pendingPhone, signIn, signUp]);

  const reset = useCallback(() => {
    setPendingPhone(null);
    setMode("signIn");
    setError(null);
  }, []);

  return {
    isReady,
    pendingPhone,
    loading,
    error,
    setError,
    sendCode,
    verifyCode,
    resendCode,
    reset,
  };
}
