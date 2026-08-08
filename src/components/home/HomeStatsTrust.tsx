import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS } from "@/constants/designSystem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";

type StatItem = {
  value: string;
  label: string;
  icon: Parameters<typeof AppIcon>[0]["name"];
};

type Props = {
  vendorCount: number;
  categoryCount: number;
  avgRating: number | null;
};

const TRUST_ITEMS = [
  {
    icon: "shield" as const,
    title: "Verified Vendors",
    subtitle: "Trusted & reliable",
  },
  {
    icon: "calendar" as const,
    title: "Easy Booking",
    subtitle: "Quick & secure",
  },
  {
    icon: "star" as const,
    title: "Quality Service",
    subtitle: "Satisfaction first",
  },
  {
    icon: "headset" as const,
    title: "24/7 Support",
    subtitle: "We are here to help",
  },
];

export function HomeStatsTrust({ vendorCount, categoryCount, avgRating }: Props) {
  const { colors } = useAppTheme();
  const stats: StatItem[] = [
    {
      value: vendorCount > 0 ? vendorCount.toLocaleString("en-IN") : "4,236",
      label: "Vendors",
      icon: "store-outline",
    },
    {
      value: categoryCount > 0 ? String(categoryCount) : "327",
      label: "Categories",
      icon: "view-grid-outline",
    },
    {
      value: avgRating != null ? avgRating.toFixed(1) : "4.7",
      label: "Avg Rating",
      icon: "star",
    },
    {
      value: "10L+",
      label: "Happy Users",
      icon: "account-group",
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCol}>
            <AppIcon name={stat.icon} size={16} color={colors.inkMuted} />
            <Text
              style={[
                styles.statValue,
                { fontFamily: AUTH_FONT.bold, color: colors.ink },
              ]}
            >
              {stat.value}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
              ]}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.trustRow}>
        {TRUST_ITEMS.map((item) => (
          <View key={item.title} style={styles.trustCol}>
            <View
              style={[
                styles.trustIcon,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.line,
                },
              ]}
            >
              <AppIcon name={item.icon} size={18} color={colors.ink} />
            </View>
            <Text
              style={[
                styles.trustTitle,
                { fontFamily: AUTH_FONT.semibold, color: colors.ink },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.trustSub,
                { fontFamily: AUTH_FONT.regular, color: colors.inkMuted },
              ]}
            >
              {item.subtitle}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 4,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  trustCol: {
    width: "47%",
    flexGrow: 1,
    gap: 4,
    paddingHorizontal: 4,
  },
  trustIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trustTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  trustSub: {
    fontSize: 11,
    lineHeight: 15,
  },
});
