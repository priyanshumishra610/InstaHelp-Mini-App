import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import {
  DAILY_REWARD,
  usePlayRewardsStore,
  WEEKLY_TARGET,
} from "@/store/playRewardsStore";
import { calendarDayKey } from "@/utils/calendarDay";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, StyleSheet, Text, View } from "react-native";

export function PlayEarnRewardsCard() {
  const playCoins = usePlayRewardsStore((s) => s.playCoins);
  const streakDays = usePlayRewardsStore((s) => s.streakDays);
  const weeklyProgress = usePlayRewardsStore((s) => s.weeklyChallengeProgress);
  const dailyClaimedKey = usePlayRewardsStore((s) => s.dailyRewardClaimedDayKey);
  const gamesPlayedToday = usePlayRewardsStore((s) => s.gamesPlayedToday);
  const claimDaily = usePlayRewardsStore((s) => s.claimDailyReward);

  const today = calendarDayKey();
  const dailyAvailable = dailyClaimedKey !== today;

  const onClaimDaily = () => {
    const result = claimDaily();
    if (!result.ok) {
      Alert.alert("Already claimed", "Come back tomorrow for your daily bonus.");
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Daily reward", `+${result.amount} play coins added!`);
  };

  const weeklyPct = Math.round((weeklyProgress / WEEKLY_TARGET) * 100);

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={["rgba(99,102,241,0.35)", "rgba(15,23,42,0.6)"]}
        style={styles.card}
      >
        <BlurView intensity={32} tint="dark" style={styles.inner}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>PLAY & EARN</Text>
              <Text style={styles.title}>Rewards lounge</Text>
            </View>
            <View style={styles.coinBadge}>
              <Ionicons name="sparkles" size={14} color="#fde68a" />
              <Text style={styles.coinBadgeText}>{playCoins}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatPill
              icon="flame"
              label="Streak"
              value={`${streakDays} days`}
              accent="#fb923c"
            />
            <StatPill
              icon="game-controller"
              label="Today"
              value={`${gamesPlayedToday} plays`}
              accent="#38bdf8"
            />
            <StatPill
              icon="pricetag"
              label="Offers"
              value="3 unlocked"
              accent="#0066FF"
            />
          </View>

          <View style={styles.challenge}>
            <View style={styles.challengeTop}>
              <Text style={styles.challengeTitle}>Weekly challenge</Text>
              <Text style={styles.challengePct}>{weeklyPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={["#818cf8", "#c084fc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${weeklyPct}%` }]}
              />
            </View>
            <Text style={styles.challengeHint}>
              Play {WEEKLY_TARGET} sessions this week · demo UI
            </Text>
          </View>

          <View style={styles.actions}>
            <PremiumPressable
              onPress={onClaimDaily}
              disabled={!dailyAvailable}
              style={[styles.actionBtn, !dailyAvailable && styles.actionDisabled]}
            >
              <LinearGradient
                colors={
                  dailyAvailable
                    ? ["#fbbf24", "#f59e0b"]
                    : ["#475569", "#334155"]
                }
                style={styles.actionGradient}
              >
                <Ionicons name="calendar" size={16} color="#1c1917" />
                <Text style={styles.actionText}>
                  {dailyAvailable
                    ? `Daily +${DAILY_REWARD}`
                    : "Daily claimed"}
                </Text>
              </LinearGradient>
            </PremiumPressable>

            <View style={styles.redeemHint}>
              <Ionicons name="ticket-outline" size={16} color="#93c5fd" />
              <Text style={styles.redeemText}>
                Redeem coins for vendor discounts — coming soon
              </Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
}

function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={14} color={accent} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    padding: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inner: {
    overflow: "hidden",
    borderRadius: 23,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "rgba(147,197,253,0.9)",
  },
  title: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "900",
    color: "#f8fafc",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.35)",
  },
  coinBadgeText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fde68a",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  },
  statPill: {
    flex: 1,
    minWidth: 96,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(148,163,184,0.95)",
    marginTop: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  challenge: {
    marginTop: 14,
  },
  challengeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  challengePct: {
    fontSize: 12,
    fontWeight: "900",
    color: "#c4b5fd",
  },
  progressTrack: {
    marginTop: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  challengeHint: {
    marginTop: 6,
    fontSize: 11,
    color: "rgba(148,163,184,0.9)",
    fontWeight: "600",
  },
  actions: {
    marginTop: 14,
    gap: 10,
  },
  actionBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  actionDisabled: {
    opacity: 0.85,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1c1917",
  },
  redeemHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  redeemText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(203,213,225,0.85)",
    lineHeight: 16,
  },
});
