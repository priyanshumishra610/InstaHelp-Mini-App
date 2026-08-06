import {
  REWARDED_AD_CREDIT_REWARD,
  REWARDED_AD_DAILY_MAX,
} from "@/constants/admob";
import { showRewardedInterstitialForCredits } from "@/services/ads/rewardedInterstitial";
import { useAdRewardsStore } from "@/store/adRewardsStore";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { calendarDayKey } from "@/utils/calendarDay";
import type { CreditTransaction } from "@/types/vendorMarketplace";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

function describeTx(tx: CreditTransaction): string {
  if (tx.kind === "credit_deduct" && tx.vendorId) return "Reveal contact";
  if (tx.kind === "credit_add") return tx.note || "Credits added";
  return tx.note || "Adjustment";
}

export function CreditHistoryModal({ visible, onClose }: Props) {
  const transactions = useVendorLeadStore((s) => s.transactions);
  const credits = useVendorLeadStore((s) => s.credits);
  const adWatchDayKey = useAdRewardsStore((s) => s.adWatchDayKey);
  const adWatchesToday = useAdRewardsStore((s) => s.adWatchesToday);
  const [busy, setBusy] = useState(false);

  const remainingToday = useMemo(() => {
    const today = calendarDayKey();
    const watches = adWatchDayKey === today ? adWatchesToday : 0;
    return Math.max(0, REWARDED_AD_DAILY_MAX - watches);
  }, [adWatchDayKey, adWatchesToday]);

  const onWatchAd = useCallback(async () => {
    if (busy) return;
    if (useAdRewardsStore.getState().remainingAdWatchesToday() <= 0) {
      Alert.alert(
        "Daily limit reached",
        `You can earn credits from up to ${REWARDED_AD_DAILY_MAX} ads per day. Come back tomorrow.`,
      );
      return;
    }

    setBusy(true);
    try {
      const result = await showRewardedInterstitialForCredits();
      if (result.ok) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Credits earned",
          `+${result.amount} credits added. ${result.remainingToday} ad reward${result.remainingToday === 1 ? "" : "s"} left today.`,
        );
        return;
      }
      if (result.reason === "dismissed") {
        Alert.alert(
          "Almost there",
          result.message ?? "Watch the full ad to earn credits.",
        );
        return;
      }
      if (result.reason === "daily_cap") {
        Alert.alert(
          "Daily limit reached",
          result.message ?? "Come back tomorrow.",
        );
        return;
      }
      if (result.reason === "unsupported") {
        Alert.alert(
          "Ads unavailable",
          result.message ?? "Open the iOS or Android app to watch ads.",
        );
        return;
      }
      Alert.alert(
        "Ad unavailable",
        result.message ?? "Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const capped = remainingToday <= 0;

  if (!visible) return null;

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Dismiss overlay" />
        <View className="max-h-[78%] rounded-t-[28px] border border-neutral-100 bg-white px-5 pb-8 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[17px] font-extrabold text-neutral-900">
              Credits & unlocks
            </Text>
            <Pressable
              hitSlop={12}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color="#525252" />
            </Pressable>
          </View>

          <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-accent-tint bg-accent-soft px-4 py-3">
            <Text className="text-[13px] font-bold text-accent-deep">
              Current balance
            </Text>
            <Text className="text-[20px] font-extrabold text-accent">{credits}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Watch ad for ${REWARDED_AD_CREDIT_REWARD} credits`}
            disabled={busy || capped}
            onPress={() => {
              void onWatchAd();
            }}
            className={`mb-4 flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${
              capped
                ? "border-neutral-200 bg-neutral-50 opacity-70"
                : "border-amber-300 bg-amber-50 active:opacity-90"
            }`}
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              {busy ? (
                <ActivityIndicator color="#B45309" />
              ) : (
                <Ionicons
                  name={capped ? "moon-outline" : "play-circle"}
                  size={24}
                  color="#B45309"
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-extrabold text-neutral-900">
                {capped ? "Ad limit reached today" : "Watch ad for credits"}
              </Text>
              <Text className="mt-0.5 text-[12px] font-medium leading-4 text-neutral-500">
                {capped
                  ? "Come back tomorrow for more free credits."
                  : `+${REWARDED_AD_CREDIT_REWARD} credits · ${remainingToday}/${REWARDED_AD_DAILY_MAX} left today`}
              </Text>
            </View>
            {!capped && !busy ? (
              <Ionicons name="chevron-forward" size={18} color="#B45309" />
            ) : null}
          </Pressable>

          <Text className="mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
            Recent activity
          </Text>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
            nestedScrollEnabled
            ListEmptyComponent={
              <Text className="py-6 text-center text-[14px] text-neutral-500">
                No transactions yet.
              </Text>
            }
            renderItem={({ item }) => (
              <View className="mb-2 rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-3">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-[13px] font-bold text-neutral-900">
                    {describeTx(item)}
                  </Text>
                  <Text
                    className={`text-[13px] font-extrabold ${
                      item.delta >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {item.delta >= 0 ? "+" : ""}
                    {item.delta}
                  </Text>
                </View>
                <Text className="mt-1 text-[11px] text-neutral-500">
                  {new Date(item.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · balance {item.balanceAfter}
                  {item.vendorId ? ` · ${item.vendorId}` : ""}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
