import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import {
  AUTH_ACCENT_YELLOW,
  AUTH_FONT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
} from "@/constants/authPremium";
import { ACCENT, HERO_LAVENDER, HERO_LAVENDER_MIST, LAVENDER_GLOW } from "@/constants/theme";
import type { ExploreCatalogState } from "@/hooks/useExploreCatalog";
import { MotiView } from "moti";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  greeting: string;
  catalog: ExploreCatalogState;
};

/** Compact home header — lavender canvas, blue energy, left-aligned app chrome. */
export function HomeExploreChrome({ greeting, catalog }: Props) {
  const [searchFocused, setSearchFocused] = useState(false);

  const {
    coords,
    credits,
    explorePlanLabel,
    entitlements,
    search,
    setSearch,
    setHistoryOpen,
  } = catalog;

  const statusLine = useMemo(() => {
    if (entitlements.isProPlus) return "Pro+ · unlimited reveals";
    if (entitlements.isPro) return "Pro · weekly reveals active";
    if (coords) return "Sorted by your location";
    return "4,500+ listings · unlock with credits";
  }, [coords, entitlements.isPro, entitlements.isProPlus]);

  return (
    <View style={styles.root}>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 420 }}
      >
        <View style={styles.topRow}>
          <View style={styles.brandBlock}>
            <LogoMark size="sm" variant="full" />
            <Text style={[styles.greeting, { fontFamily: AUTH_FONT.medium }]}>
              Hi {greeting}
            </Text>
          </View>

          <Pressable
            onPress={() => setHistoryOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="View credit balance"
            hitSlop={8}
            style={({ pressed }) => [styles.creditsPill, pressed && styles.pressed]}
          >
            <AnimatedNumber
              value={credits}
              style={[styles.creditsValue, { fontFamily: AUTH_FONT.bold }]}
            />
            <Text style={[styles.creditsLabel, { fontFamily: AUTH_FONT.semibold }]}>
              credits
            </Text>
            {explorePlanLabel ? (
              <View style={styles.planDot}>
                <Text style={[styles.planTag, { fontFamily: AUTH_FONT.bold }]}>
                  {explorePlanLabel}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.headlineBlock}>
          <Text style={[styles.headline, { fontFamily: AUTH_FONT.bold }]}>
            Discover vendors across{" "}
            <Text style={[styles.headlineAccent, { fontFamily: AUTH_FONT.bold }]}>
              India
            </Text>
          </Text>
          <View style={styles.markRow}>
            <View style={styles.markBlue} />
            <View style={styles.markYellow} />
          </View>
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 480, delay: 60 }}
      >
        <View
          style={[
            styles.searchCard,
            searchFocused ? styles.searchCardFocused : null,
          ]}
        >
          <View style={styles.searchShell}>
            <Input
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search vendors..."
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 border-0 bg-transparent py-3.5 text-[15px]"
              placeholderTextColor="#94A3B8"
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Text style={[styles.clearText, { fontFamily: AUTH_FONT.semibold }]}>
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Text style={[styles.statusLine, { fontFamily: AUTH_FONT.regular }]}>
          {statusLine}
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  brandBlock: {
    flex: 1,
    gap: 6,
  },
  greeting: {
    fontSize: 13,
    color: "#6B7280",
    letterSpacing: 0.1,
    marginLeft: 2,
  },
  creditsPill: {
    alignItems: "center",
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.1)",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  creditsValue: {
    fontSize: 20,
    color: ACCENT,
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
  },
  creditsLabel: {
    fontSize: 9,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginTop: 1,
  },
  planDot: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: HERO_LAVENDER_MIST,
  },
  planTag: {
    fontSize: 8,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: AUTH_PRIMARY,
  },
  headlineBlock: {
    marginTop: 16,
    paddingRight: 24,
  },
  headline: {
    fontSize: 24,
    lineHeight: 30,
    color: "#111827",
    letterSpacing: -0.35,
  },
  headlineAccent: {
    color: AUTH_PRIMARY_DEEP,
  },
  markRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
  },
  markBlue: {
    width: 24,
    height: 3,
    borderRadius: 99,
    backgroundColor: AUTH_PRIMARY,
  },
  markYellow: {
    width: 12,
    height: 3,
    borderRadius: 99,
    backgroundColor: AUTH_ACCENT_YELLOW,
  },
  searchCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.08)",
    shadowColor: LAVENDER_GLOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  searchCardFocused: {
    borderColor: "rgba(0,74,173,0.28)",
    shadowColor: AUTH_PRIMARY,
    shadowOpacity: 0.12,
  },
  searchShell: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 19,
    backgroundColor: HERO_LAVENDER,
    paddingHorizontal: 12,
  },
  statusLine: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
    paddingHorizontal: 2,
  },
  clearText: {
    fontSize: 12,
    color: ACCENT,
  },
  pressed: {
    opacity: 0.88,
  },
});
