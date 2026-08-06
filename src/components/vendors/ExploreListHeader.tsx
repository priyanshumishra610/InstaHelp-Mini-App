import { Input } from "@/components/ui/Input";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { ExploreGlassCard } from "@/components/vendors/ExploreGlassCard";
import { RADIUS } from "@/constants/designSystem";
import { ACCENT, ACCENT_TINT } from "@/constants/theme";
import type { ExploreEntitlements } from "@/services/explore/exploreEntitlements";
import { MotiView } from "moti";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ExploreListHeaderProps = {
  coords: { lat: number; lng: number } | null;
  activeFilterCount: number;
  credits: number;
  explorePlanLabel?: string | null;
  entitlements: ExploreEntitlements;
  onUpgrade: () => void;
  onOpenHistory: () => void;
  onOpenFilters: () => void;
  search: string;
  setSearch: (value: string) => void;
  clearFilters: () => void;
};

export function ExploreListHeader(props: ExploreListHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  const {
    coords,
    activeFilterCount,
    credits,
    explorePlanLabel,
    entitlements,
    onUpgrade,
    onOpenHistory,
    onOpenFilters,
    search,
    setSearch,
    clearFilters,
  } = props;

  return (
    <View className="px-4 pb-1 pt-1">
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 420 }}
      >
        <ExploreGlassCard intensity="strong" radius={RADIUS.xxl}>
          <View className="px-4 pb-4 pt-5">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 pr-2">
                <Text
                  className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: ACCENT }}
                >
                  InstaHelp Explore
                </Text>
                <Text className="mt-2.5 text-[26px] font-extrabold leading-[32px] tracking-tight text-neutral-950">
                  Vendors across{" "}
                  <Text style={{ color: ACCENT }}>India</Text>
                </Text>
                <Text className="mt-2 text-[13px] font-medium leading-[19px] text-neutral-500">
                  {entitlements.isPro
                    ? entitlements.isProPlus
                      ? "Pro+ active — unlimited reveals & multi-city unlocked."
                      : "Pro active — weekly reveals & verified filter on."
                    : coords
                      ? "Sorted by your location. Unlock contacts with credits."
                      : "Browse by city or category — unlock contacts with credits."}
                </Text>
              </View>

              <Pressable
                onPress={onOpenHistory}
                accessibilityRole="button"
                accessibilityLabel="View credit history"
                className="active:opacity-85"
              >
                <GlassSurface
                  blur
                  intensity="soft"
                  shadow="sm"
                  radius={RADIUS.lg}
                  style={styles.creditsGlass}
                >
                  <View className="items-center px-4 py-3">
                    <Text className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                      Balance
                    </Text>
                    <AnimatedNumber
                      value={credits}
                      className="mt-1 text-[22px] font-black"
                      style={{ color: ACCENT }}
                    />
                    <Text className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
                      credits
                    </Text>
                    {explorePlanLabel ? (
                      <View className="mt-2 rounded-full px-2.5 py-0.5" style={styles.planPill}>
                        <Text
                          className="text-[8px] font-bold uppercase tracking-wide"
                          style={{ color: ACCENT }}
                        >
                          {explorePlanLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </GlassSurface>
              </Pressable>
            </View>

            {!entitlements.isPro ? (
              <View className="mt-4">
                <GlowButton
                  label="Upgrade Explore plan"
                  onPress={onUpgrade}
                  variant="primary"
                  fullWidth
                />
              </View>
            ) : null}
          </View>
        </ExploreGlassCard>
      </MotiView>

      <View className="mt-4 flex-row items-center gap-2.5">
        <GlassSurface
          blur={searchFocused}
          intensity="medium"
          shadow="sm"
          radius={RADIUS.lg}
          style={[
            styles.searchGlass,
            { flex: 1 },
            searchFocused ? styles.searchGlassFocused : null,
          ]}
        >
          <View className="flex-row items-center px-4">
            <Input
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search vendors..."
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 border-0 bg-transparent py-3.5 text-[15px] text-neutral-900"
              placeholderTextColor="#A8A29E"
            />
            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch("")}
                hitSlop={10}
                accessibilityLabel="Clear search"
                className="rounded-full px-2 py-1 active:opacity-70"
              >
                <Text className="text-[12px] font-semibold" style={{ color: ACCENT }}>
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>
        </GlassSurface>

        <Pressable
          onPress={onOpenFilters}
          accessibilityRole="button"
          accessibilityLabel="Open sort and filter"
          className="active:opacity-90"
        >
          <GlassSurface blur intensity="medium" shadow="sm" radius={RADIUS.lg} style={styles.filterBtn}>
            <View className="relative items-center justify-center px-3.5 py-3">
              <Text className="text-[11px] font-bold" style={{ color: ACCENT }}>
                Filter
              </Text>
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text className="text-[9px] font-extrabold text-white">
                    {activeFilterCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </GlassSurface>
        </Pressable>
      </View>

      {activeFilterCount > 0 ? (
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mt-2.5"
        >
          <GlassSurface blur intensity="soft" shadow="sm" radius={RADIUS.md}>
            <View className="flex-row items-center justify-between px-3.5 py-2.5">
              <Text className="text-[12px] font-semibold text-neutral-600">
                {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} active
              </Text>
              <Pressable
                onPress={clearFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
                className="rounded-full px-3 py-1.5 active:opacity-70"
                style={styles.clearPill}
              >
                <Text className="text-[11px] font-bold" style={{ color: ACCENT }}>
                  Reset
                </Text>
              </Pressable>
            </View>
          </GlassSurface>
        </MotiView>
      ) : null}

      <View className="h-2" />
    </View>
  );
}

const styles = StyleSheet.create({
  creditsGlass: {
    minWidth: 88,
    borderColor: "rgba(0,74,173,0.14)",
  },
  planPill: {
    backgroundColor: ACCENT_TINT,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,74,173,0.15)",
  },
  searchGlass: {
    overflow: "hidden",
  },
  searchGlassFocused: {
    borderColor: "rgba(0,74,173,0.35)",
  },
  filterBtn: {
    minWidth: 72,
    borderColor: "rgba(0,74,173,0.18)",
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  clearPill: {
    backgroundColor: ACCENT_TINT,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,74,173,0.12)",
  },
});
