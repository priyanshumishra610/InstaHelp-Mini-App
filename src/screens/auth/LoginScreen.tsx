import { phoneSchema } from "@/api/schemas/serviceRequest";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useGoogleSignIn } from "@/hooks/auth/useGoogleSignIn";
import { usePhoneOtp } from "@/hooks/auth/usePhoneOtp";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { formatPhoneDisplay } from "@/utils/auth/phone";
import { syncClerkUserToProfile } from "@/utils/auth/syncClerkProfile";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOutLeft,
} from "react-native-reanimated";
import { z } from "zod";

const PERKS = [
  { icon: "flash" as const, text: "Instant matching" },
  { icon: "shield-checkmark" as const, text: "Verified pros" },
  { icon: "chatbubbles" as const, text: "WhatsApp concierge" },
];

const phoneFormSchema = z.object({ phone: phoneSchema.shape.phone });
type PhoneForm = z.infer<typeof phoneFormSchema>;

const otpSchema = z.object({
  code: z.string().min(4, "Enter the code").max(8, "Invalid code"),
});
type OtpForm = z.infer<typeof otpSchema>;

export function LoginScreen() {
  const router = useRouter();
  const { user } = useUser();
  const enterGuestMode = useOnboardingStore((s) => s.enterGuestMode);
  const { isSignedIn } = useAppAuth();

  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const {
    pendingPhone,
    loading: otpLoading,
    error: otpError,
    setError: setOtpError,
    sendCode,
    verifyCode,
    resendCode,
    reset,
  } = usePhoneOtp();
  const {
    signInWithGoogle,
    loading: googleLoading,
    error: googleError,
    setError: setGoogleError,
  } = useGoogleSignIn();

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: "+91 " },
    mode: "onTouched",
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (isSignedIn && user) {
      syncClerkUserToProfile(user);
    }
  }, [isSignedIn, user]);

  const goToOnboarding = () => {
    router.replace("/(auth)/name");
  };

  const onSendCode = phoneForm.handleSubmit(async ({ phone }) => {
    setGoogleError(null);
    const ok = await sendCode(phone);
    if (ok) setPhase("otp");
  });

  const onVerify = otpForm.handleSubmit(async ({ code }) => {
    const ok = await verifyCode(code);
    if (ok) goToOnboarding();
  });

  const onGoogle = async () => {
    setOtpError(null);
    const ok = await signInWithGoogle();
    if (ok) goToOnboarding();
  };

  const onGuest = () => {
    enterGuestMode();
    useProfileStore.getState().setProfile({
      phone: "guest",
      addresses: [
        { id: "home", label: "Home", line: "Add your home address in Profile" },
      ],
      favorites: [],
    });
    router.replace("/(auth)/name");
  };

  const displayError = otpError || googleError;
  const busy = otpLoading || googleLoading;

  return (
    <Screen>
      <View
        pointerEvents="none"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent"
        style={{ opacity: 0.18 }}
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-brand-blue"
        style={{ opacity: 0.06 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 18,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeIn.duration(400).easing(Easing.out(Easing.cubic))}
            className="flex-row items-center justify-between"
          >
            <LogoMark size="md" withWordmark />
            <View className="flex-row items-center gap-1.5">
              <View
                className={`h-1.5 rounded-full ${
                  phase === "phone" ? "w-7 bg-brand-blue" : "w-2 bg-neutral-200"
                }`}
              />
              <View className="h-1.5 w-2 rounded-full bg-neutral-200" />
              <View className="h-1.5 w-2 rounded-full bg-neutral-200" />
            </View>
          </Animated.View>

          {phase === "phone" ? (
            <Animated.View
              entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
              exiting={FadeOutLeft.duration(220)}
              style={{ flex: 1, marginTop: 44 }}
            >
              <Animated.View entering={FadeInUp.delay(60).duration(420)}>
                <View className="flex-row items-center gap-2">
                  <View className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                  <Text className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                    Welcome aboard
                  </Text>
                </View>
                <Text className="mt-4 text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                  Let&apos;s get
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                    you set up.
                  </Text>
                  <View className="ml-3 h-2 w-10 rounded-full bg-accent" />
                </View>
                <Text className="mt-3 text-[15px] leading-[22px] text-neutral-500">
                  Sign in with your number or Google. We&apos;ll text you a
                  one-time code.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(180).duration(420)}
                className="mt-7"
              >
                <View className="flex-row items-center gap-3">
                  {PERKS.map((p) => (
                    <View
                      key={p.text}
                      className="flex-1 items-center gap-2 rounded-2xl border border-brand-line bg-white px-2 py-3"
                    >
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
                        <Ionicons name={p.icon} size={15} color="#ffffff" />
                      </View>
                      <Text
                        className="text-[11px] font-bold text-neutral-700 text-center"
                        numberOfLines={1}
                      >
                        {p.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(320).duration(420)}
                className="mt-8 gap-5"
              >
                <Controller
                  control={phoneForm.control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                      label="Phone number"
                      error={phoneForm.formState.errors.phone?.message}
                    >
                      <Input
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={!!phoneForm.formState.errors.phone}
                        returnKeyType="next"
                        onSubmitEditing={onSendCode}
                      />
                    </FormField>
                  )}
                />

                {displayError ? (
                  <InlineError message={displayError} />
                ) : null}

                <View className="flex-row items-center gap-2">
                  <Ionicons name="lock-closed" size={12} color="#737373" />
                  <Text className="text-[11px] font-medium text-neutral-500">
                    Secured with Clerk. OTP never leaves your device.
                  </Text>
                </View>
              </Animated.View>

              <View style={{ flex: 1 }} />

              <Animated.View
                entering={FadeInDown.delay(440).duration(420)}
                className="mt-8 gap-3"
              >
                <Pressable
                  onPress={onSendCode}
                  disabled={busy}
                  className={`rounded-2xl bg-neutral-900 py-4 active:opacity-90 ${
                    busy ? "opacity-60" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {otpLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text className="text-base font-bold text-white">
                          Send code
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                      </>
                    )}
                  </View>
                </Pressable>

                <Pressable
                  onPress={onGoogle}
                  disabled={busy}
                  className="flex-row items-center justify-center gap-2 rounded-2xl border border-brand-line bg-white py-4 active:opacity-90"
                >
                  {googleLoading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={18} color="#4285F4" />
                      <Text className="text-base font-bold text-neutral-900">
                        Continue with Google
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={onGuest}
                  disabled={busy}
                  className="py-2 active:opacity-70"
                >
                  <Text className="text-center text-sm font-semibold text-neutral-500">
                    Browse as guest
                  </Text>
                </Pressable>

                <Text className="text-center text-[11px] text-neutral-400">
                  By continuing you agree to InstaHelp&apos;s service terms.
                </Text>
              </Animated.View>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
              exiting={FadeOutLeft.duration(220)}
              style={{ flex: 1, marginTop: 44 }}
            >
              <Pressable
                onPress={() => {
                  reset();
                  setPhase("phone");
                }}
                className="self-start flex-row items-center gap-1.5 rounded-full border border-brand-line bg-white px-3 py-2"
              >
                <Ionicons name="chevron-back" size={14} color="#000000" />
                <Text className="text-xs font-bold tracking-wide text-neutral-800">
                  {pendingPhone
                    ? formatPhoneDisplay(pendingPhone)
                    : "Edit number"}
                </Text>
              </Pressable>

              <Animated.View entering={FadeInUp.delay(60).duration(420)}>
                <View className="mt-5 flex-row items-center gap-2">
                  <View className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                  <Text className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                    Verify
                  </Text>
                </View>
                <Text className="mt-4 text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                  Enter your code
                </Text>
                <Text className="mt-3 text-[15px] leading-[22px] text-neutral-500">
                  We sent a 6-digit code to your phone.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(180).duration(420)}
                className="mt-8"
              >
                <Controller
                  control={otpForm.control}
                  name="code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                      label="Verification code"
                      error={otpForm.formState.errors.code?.message}
                    >
                      <Input
                        keyboardType="number-pad"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={!!otpForm.formState.errors.code}
                        maxLength={8}
                      />
                    </FormField>
                  )}
                />
                {displayError ? <InlineError message={displayError} /> : null}
              </Animated.View>

              <View style={{ flex: 1 }} />

              <Animated.View
                entering={FadeInDown.delay(360).duration(420)}
                className="mt-8 gap-3"
              >
                <Pressable
                  onPress={onVerify}
                  disabled={busy}
                  className={`rounded-2xl bg-neutral-900 py-4 active:opacity-90 ${
                    busy ? "opacity-60" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {busy ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text className="text-base font-bold text-white">
                          Verify and continue
                        </Text>
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      </>
                    )}
                  </View>
                </Pressable>
                <Pressable onPress={resendCode} disabled={busy} className="py-2">
                  <Text className="text-center text-sm font-semibold text-brand-blue">
                    Resend code
                  </Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3">
      <Ionicons name="alert-circle" size={16} color="#dc2626" />
      <Text className="flex-1 text-xs font-medium text-red-600">{message}</Text>
    </View>
  );
}
