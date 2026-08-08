import { DraggableFab } from "@/components/home/DraggableFab";
import { AUTH_FONT, AUTH_PRIMARY, AUTH_PRIMARY_LIGHT } from "@/constants/authPremium";
import { TAB_BAR_BASE_HEIGHT } from "@/constants/tabBar";
import { HERO_LAVENDER_MIST, LAVENDER_GLOW } from "@/constants/theme";
import { useHomeHubStore } from "@/store/homeHubStore";
/* TUTORIAL_DISABLED — tutorialFeature.ts
import { useTutorialStore } from "@/store/tutorialStore";
*/
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

export { TAB_BAR_BASE_HEIGHT };

const TUTORIAL_TARGET = "sort-filter-fab";

type Props = {
  offsetTabBar?: boolean;
};

/** Floating hub — opens sort, filter, and concierge. Drag to reposition. */
export function HomeHubFab({ offsetTabBar = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const open = useHomeHubStore((s) => s.open);
  const activeFilterCount = useHomeHubStore((s) => s.activeFilterCount);

  const onPress = () => {
    const onHome =
      pathname === "/(tabs)" ||
      pathname === "/(tabs)/" ||
      pathname === "/(tabs)/index" ||
      pathname.endsWith("/index");
    if (!onHome) {
      router.push("/(tabs)");
    }
    /* TUTORIAL_DISABLED
    if (TUTORIAL_ENABLED) {
      useTutorialStore.getState().advanceOnTarget(TUTORIAL_TARGET);
    }
    */
    open();
  };

  return (
    <DraggableFab
      id="sort-filter"
      tutorialId={TUTORIAL_TARGET}
      defaultAnchor="bottom-right"
      offsetTabBar={offsetTabBar}
      entranceDelayMs={300}
      accessibilityLabel="Sort and filter"
      onPress={onPress}
    >
      <View style={styles.lavenderHalo} pointerEvents="none">
        <View style={styles.glow}>
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
        </View>
      </View>
    </DraggableFab>
  );
}

const styles = StyleSheet.create({
  lavenderHalo: {
    alignSelf: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: LAVENDER_GLOW,
        shadowOpacity: 0.28,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  glow: {
    alignSelf: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: AUTH_PRIMARY,
        shadowOpacity: 0.38,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  rim: {
    alignSelf: "flex-start",
    borderRadius: 999,
    padding: 1.5,
    backgroundColor: HERO_LAVENDER_MIST,
    overflow: "hidden",
  },
  fill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  label: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    letterSpacing: 0.2,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
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
