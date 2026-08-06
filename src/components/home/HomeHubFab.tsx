import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AUTH_FONT, AUTH_PRIMARY, AUTH_PRIMARY_LIGHT } from "@/constants/authPremium";
import { HERO_LAVENDER_MIST, LAVENDER_GLOW } from "@/constants/theme";
import { useHomeHubStore } from "@/store/homeHubStore";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { MotiView } from "moti";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TAB_BAR_BASE_HEIGHT = 64;
const FAB_GAP = 16;

type Props = {
  offsetTabBar?: boolean;
};

/** Floating hub — opens sort, filter, and concierge in one sheet. */
export function HomeHubFab({ offsetTabBar = true }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const open = useHomeHubStore((s) => s.open);
  const activeFilterCount = useHomeHubStore((s) => s.activeFilterCount);

  const bottomInset = Math.max(insets.bottom, 8);
  const bottom = offsetTabBar
    ? TAB_BAR_BASE_HEIGHT + bottomInset + FAB_GAP + 4
    : bottomInset + FAB_GAP;

  const onPress = () => {
    const onHome =
      pathname === "/(tabs)" ||
      pathname === "/(tabs)/" ||
      pathname === "/(tabs)/index" ||
      pathname.endsWith("/index");
    if (!onHome) {
      router.push("/(tabs)");
    }
    open();
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", right: 16, bottom, zIndex: 50 }}
    >
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 14, stiffness: 220, delay: 300 }}
      >
        <View style={styles.lavenderHalo}>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Sort and filter"
            onPress={onPress}
            haptic
            scaleTo={0.94}
            style={styles.glow}
          >
            <View style={styles.rim}>
              <LinearGradient
                colors={[AUTH_PRIMARY, AUTH_PRIMARY_LIGHT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fill}
              >
                <Text style={[styles.label, { fontFamily: AUTH_FONT.bold }]}>
                  Sort & Filter
                </Text>
                {activeFilterCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={[styles.badgeText, { fontFamily: AUTH_FONT.bold }]}>
                      {activeFilterCount}
                    </Text>
                  </View>
                ) : null}
              </LinearGradient>
            </View>
          </AnimatedPressable>
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  lavenderHalo: Platform.select({
    ios: {
      shadowColor: LAVENDER_GLOW,
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 12 },
    default: {},
  }) ?? {},
  glow: Platform.select({
    ios: {
      shadowColor: AUTH_PRIMARY,
      shadowOpacity: 0.38,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 8 },
    default: {},
  }) ?? {},
  rim: {
    borderRadius: 999,
    padding: 1.5,
    backgroundColor: HERO_LAVENDER_MIST,
  },
  fill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    overflow: "hidden",
  },
  label: {
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    color: AUTH_PRIMARY,
  },
});
