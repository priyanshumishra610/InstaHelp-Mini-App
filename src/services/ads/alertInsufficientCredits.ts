import { REWARDED_AD_CREDIT_REWARD } from "@/constants/admob";
import { showRewardedInterstitialForCredits } from "@/services/ads/rewardedInterstitial";
import { Alert, type AlertButton } from "react-native";

type Options = {
  needCredits: number;
  onOpenPlans?: () => void;
  /** Opens credits sheet where the watch-ad option also lives. */
  onOpenCredits?: () => void;
};

/**
 * Policy-compliant prompt: user opts in to a rewarded ad for credits.
 */
export function alertInsufficientCredits(options: Options): void {
  const buttons: AlertButton[] = [
    { text: "Cancel", style: "cancel" },
    {
      text: `Watch ad (+${REWARDED_AD_CREDIT_REWARD})`,
      onPress: () => {
        void (async () => {
          const result = await showRewardedInterstitialForCredits();
          if (result.ok) {
            Alert.alert(
              "Credits earned",
              `+${result.amount} credits added. You can unlock the contact now.`,
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
          if (result.reason === "unsupported" && options.onOpenCredits) {
            Alert.alert(
              "Ads unavailable here",
              "Open Credits on iOS or Android to watch ads for free points.",
              [
                { text: "OK", style: "cancel" },
                { text: "Open credits", onPress: options.onOpenCredits },
              ],
            );
            return;
          }
          Alert.alert(
            "Ad unavailable",
            result.message ?? "Please try again in a moment.",
          );
        })();
      },
    },
  ];

  if (options.onOpenPlans) {
    buttons.push({ text: "View plans", onPress: options.onOpenPlans });
  } else if (options.onOpenCredits) {
    buttons.push({ text: "Credits", onPress: options.onOpenCredits });
  }

  Alert.alert(
    "Not enough credits",
    `You need ${options.needCredits} credits to unlock this contact. Watch a short ad for +${REWARDED_AD_CREDIT_REWARD} credits, or tap your credit balance anytime.`,
    buttons,
  );
}
