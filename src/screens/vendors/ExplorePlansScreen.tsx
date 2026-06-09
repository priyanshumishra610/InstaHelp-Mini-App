import {
  apiCreateExploreOrder,
  apiVerifyExplorePayment,
} from "@/api/appsScriptClient";
import { RazorpayCheckoutModal } from "@/components/vendors/RazorpayCheckoutModal";
import {
  EXPLORE_PLANS,
  formatInr,
  type ExplorePlan,
  type ExplorePlanId,
} from "@/constants/explorePlans";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useRefreshExploreSubscription } from "@/services/explore/exploreRevealService";
import { useExploreSubscriptionStore } from "@/store/exploreSubscriptionStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CheckoutState = {
  keyId: string;
  orderId: string;
  amount: number;
  planId: ExplorePlanId;
  planLabel: string;
};

function PlanCard({
  plan,
  selected,
  paying,
  onSelect,
  onSubscribe,
}: {
  plan: ExplorePlan;
  selected: boolean;
  paying: boolean;
  onSelect: () => void;
  onSubscribe: () => void;
}) {
  const isFree = plan.id === "free";
  const priceLabel =
    plan.priceInr === null
      ? "—"
      : plan.priceInr === 0
        ? "₹0"
        : formatInr(plan.priceInr);

  return (
    <View
      className="mb-5 overflow-hidden rounded-3xl border border-neutral-200 bg-white"
      style={
        Platform.OS === "ios"
          ? {
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.06,
              shadowRadius: 14,
            }
          : { elevation: 2 }
      }
    >
      <View className="px-5 pb-5 pt-5">
        <Text className="text-[26px] font-bold tracking-tight text-neutral-950">
          {plan.name}
        </Text>
        <Text className="mt-1 text-[15px] text-neutral-600">{plan.tagline}</Text>

        <Pressable
          onPress={onSelect}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          className={`mt-5 rounded-2xl border px-4 py-4 ${
            selected
              ? "border-accent bg-accent-soft/60"
              : "border-neutral-200 bg-neutral-50"
          }`}
        >
          <View className="flex-row items-start gap-3">
            <View
              className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 ${
                selected ? "border-accent bg-white" : "border-neutral-300 bg-white"
              }`}
            >
              {selected ? (
                <View className="h-2.5 w-2.5 rounded-full bg-accent" />
              ) : null}
            </View>
            <View className="flex-1">
              <Text className="text-[22px] font-bold text-neutral-950">{priceLabel}</Text>
              {plan.billingLabel ? (
                <Text className="mt-0.5 text-[14px] text-neutral-600">
                  {plan.billingLabel} · 30 days access
                </Text>
              ) : (
                <Text className="mt-0.5 text-[14px] text-neutral-600">Always free</Text>
              )}
              {plan.id === "pro" ? (
                <Text className="mt-1 text-[13px] font-semibold text-accent-deep">
                  10 reveals per week
                </Text>
              ) : null}
              {plan.id === "pro_plus" ? (
                <Text className="mt-1 text-[13px] font-semibold text-accent-deep">
                  Unlimited reveals
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={onSubscribe}
          disabled={paying}
          accessibilityRole="button"
          accessibilityLabel={plan.ctaLabel}
          className={`mt-4 items-center rounded-2xl py-4 active:opacity-90 ${
            isFree ? "border border-neutral-300 bg-white" : "bg-neutral-950"
          } ${paying ? "opacity-70" : ""}`}
        >
          {paying ? (
            <ActivityIndicator color={isFree ? "#171717" : "#ffffff"} />
          ) : (
            <Text
              className={`text-[16px] font-bold ${
                isFree ? "text-neutral-900" : "text-white"
              }`}
            >
              {plan.ctaLabel}
            </Text>
          )}
        </Pressable>

        <Text className="mt-5 text-[15px] font-bold text-neutral-900">
          {plan.featuresHeader}
        </Text>
        <View className="mt-3 gap-2.5">
          {plan.features.map((feature) => (
            <View key={feature} className="flex-row items-start gap-2.5">
              <Ionicons
                name="checkmark"
                size={16}
                color="#737373"
                style={{ marginTop: 2 }}
              />
              <Text className="flex-1 text-[14px] leading-5 text-neutral-700">
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {plan.limitsNote ? (
          <Pressable
            onPress={() =>
              Alert.alert("Plan limits", plan.limitsNote!, [{ text: "OK" }])
            }
            accessibilityRole="button"
          >
            <Text className="mt-4 text-[13px] text-neutral-500 underline">
              Limits apply
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ExplorePlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const phone = useAuthPhone();
  const refreshSubscription = useRefreshExploreSubscription();
  const activeSub = useExploreSubscriptionStore((s) => s.subscription);

  useEffect(() => {
    if (phone) void refreshSubscription(phone);
  }, [phone, refreshSubscription]);

  const defaultPlan =
    EXPLORE_PLANS.find((p) => p.recommended)?.id ?? ("pro" satisfies ExplorePlanId);
  const [selectedPlanId, setSelectedPlanId] = useState<ExplorePlanId>(defaultPlan);
  const [payingPlanId, setPayingPlanId] = useState<ExplorePlanId | null>(null);
  const [checkout, setCheckout] = useState<CheckoutState | null>(null);

  const activePlanLabel = useMemo(() => {
    if (activeSub?.status !== "active") return null;
    if (activeSub.plan === "pro") return "Pro active";
    if (activeSub.plan === "pro_plus") return "Pro+ active";
    return null;
  }, [activeSub]);

  const startCheckout = useCallback(
    async (plan: ExplorePlan) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      if (plan.id === "free") {
        router.back();
        return;
      }

      if (!phone) {
        Alert.alert("Sign in required", "Please sign in with your phone number first.");
        return;
      }

      setPayingPlanId(plan.id);
      try {
        const orderRes = await apiCreateExploreOrder(phone, plan.id);
        if (!orderRes.ok) {
          const detail =
            orderRes.error.includes("UrlFetchApp") ||
            orderRes.error.includes("not authorized in Apps Script")
              ? "Payment backend needs a one-time Apps Script authorization. Ask support to run authorizeExploreServices() and redeploy the web app."
              : orderRes.error;
          Alert.alert("Could not start payment", detail);
          return;
        }

        setCheckout({
          keyId: orderRes.data.keyId,
          orderId: orderRes.data.orderId,
          amount: orderRes.data.amount,
          planId: plan.id,
          planLabel: `${plan.name} · ${formatInr(plan.priceInr ?? 0)}`,
        });
      } finally {
        setPayingPlanId(null);
      }
    },
    [phone, router],
  );

  const handlePaymentSuccess = useCallback(
    async (payment: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      if (!checkout || !phone) return;

      setCheckout(null);
      setPayingPlanId(checkout.planId);

      try {
        const verifyRes = await apiVerifyExplorePayment({
          phone,
          planId: checkout.planId,
          razorpayOrderId: payment.razorpay_order_id,
          razorpayPaymentId: payment.razorpay_payment_id,
          razorpaySignature: payment.razorpay_signature,
        });

        if (!verifyRes.ok) {
          Alert.alert("Payment verification failed", verifyRes.error);
          return;
        }

        useExploreSubscriptionStore.getState().setSubscription(verifyRes.data);
        await refreshSubscription(phone);

        Alert.alert(
          "Plan activated",
          `Your ${checkout.planId === "pro_plus" ? "Pro+" : "Pro"} plan is now active for 30 days.`,
          [{ text: "Great", onPress: () => router.back() }],
        );
      } finally {
        setPayingPlanId(null);
      }
    },
    [checkout, phone, refreshSubscription, router],
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close plans"
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
          >
            <Ionicons name="close" size={26} color="#171717" />
          </Pressable>
        </View>

        <Text className="text-center text-[28px] font-bold tracking-tight text-neutral-950">
          Get more InstaHelp
        </Text>
        <Text className="mt-2 text-center text-[16px] text-neutral-600">
          Choose the plan right for you
        </Text>

        {activePlanLabel ? (
          <View className="mt-4 self-center rounded-full bg-accent-soft px-4 py-2">
            <Text className="text-[12px] font-bold text-accent-deep">
              {activePlanLabel}
              {activeSub?.periodEnd
                ? ` · until ${new Date(activeSub.periodEnd).toLocaleDateString("en-IN")}`
                : ""}
            </Text>
          </View>
        ) : null}

        <View className="mt-8">
          {EXPLORE_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              paying={payingPlanId === plan.id}
              onSelect={() => {
                void Haptics.selectionAsync().catch(() => {});
                setSelectedPlanId(plan.id);
              }}
              onSubscribe={() => startCheckout(plan)}
            />
          ))}
        </View>

        <View className="mt-2 flex-row flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Pressable onPress={() => Linking.openURL(LEGAL_TERMS_URL).catch(() => {})}>
            <Text className="text-[13px] text-neutral-500 underline">Terms</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(LEGAL_PRIVACY_URL).catch(() => {})}>
            <Text className="text-[13px] text-neutral-500 underline">
              Privacy Policy
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {checkout ? (
        <RazorpayCheckoutModal
          visible
          keyId={checkout.keyId}
          orderId={checkout.orderId}
          amount={checkout.amount}
          planLabel={checkout.planLabel}
          prefillContact={phone ?? undefined}
          onSuccess={handlePaymentSuccess}
          onDismiss={() => setCheckout(null)}
          onError={(message) => {
            setCheckout(null);
            Alert.alert("Payment failed", message);
          }}
        />
      ) : null}
    </View>
  );
}
