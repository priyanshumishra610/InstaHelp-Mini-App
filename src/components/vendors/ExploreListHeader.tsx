import { Input } from "@/components/ui/Input";
import { MarketplaceChip } from "@/components/vendors/MarketplaceChip";
import { GAME_OPEN_CREDIT_REWARD, VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import type { ExploreEntitlements } from "@/services/explore/exploreEntitlements";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { calendarDayKey } from "@/utils/calendarDay";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

export type ExploreListHeaderProps = {
  coords: { lat: number; lng: number } | null;
  activeFilterCount: number;
  credits: number;
  explorePlanLabel?: string | null;
  entitlements: ExploreEntitlements;
  onUpgrade: () => void;
  multiCityMode: boolean;
  multiCityKeys: string[];
  onToggleMultiCityMode: () => void;
  onToggleMultiCityKey: (key: string) => void;
  onOpenHistory: () => void;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  cityOptions: ReadonlyArray<readonly [string, string]>;
  cityKey: string | null;
  setCityKey: Dispatch<SetStateAction<string | null>>;
  areaOptions: ReadonlyArray<readonly [string, string]>;
  areaKey: string | null;
  setAreaKey: Dispatch<SetStateAction<string | null>>;
  sortMode: "recommended" | "distance" | "rating";
  toggleSortMode: (next: "distance" | "rating") => void;
  verifiedOnly: boolean;
  setVerifiedOnly: Dispatch<SetStateAction<boolean>>;
  availableNowOnly: boolean;
  setAvailableNowOnly: Dispatch<SetStateAction<boolean>>;
  clearFilters: () => void;
};

function ChipRail({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-end justify-between pr-1">
        <Text className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-neutral-500">
          {title}
        </Text>
        {hint ? (
          <Text className="text-[10px] font-semibold text-neutral-400">
            {hint}
          </Text>
        ) : null}
      </View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, flexDirection: "row", paddingRight: 8 }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function ExploreListHeader(props: ExploreListHeaderProps) {
  const heroCardShadow =
    Platform.OS === "ios"
      ? {
          shadowColor: "#5B21B6",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        }
      : { elevation: 4 };

  const {
    coords,
    activeFilterCount,
    credits,
    explorePlanLabel,
    entitlements,
    onUpgrade,
    multiCityMode,
    multiCityKeys,
    onToggleMultiCityMode,
    onToggleMultiCityKey,
    onOpenHistory,
    search,
    setSearch,
    cityOptions,
    cityKey,
    setCityKey,
    areaOptions,
    areaKey,
    setAreaKey,
    sortMode,
    toggleSortMode,
    verifiedOnly,
    setVerifiedOnly,
    availableNowOnly,
    setAvailableNowOnly,
    clearFilters,
  } = props;

  const router = useRouter();
  const bonusGridDay = useVendorLeadStore((s) => s.bonusTicTacToeAwardDayKey);
  const bonusHangDay = useVendorLeadStore((s) => s.bonusHangmanAwardDayKey);
  const bonusWhackE = useVendorLeadStore((s) => s.bonusWhackEasyDayKey);
  const bonusWhackM = useVendorLeadStore((s) => s.bonusWhackMediumDayKey);
  const bonusWhackH = useVendorLeadStore((s) => s.bonusWhackHardDayKey);

  const todayKey = calendarDayKey();
  const canClaimBonusCredits =
    bonusGridDay !== todayKey ||
    bonusHangDay !== todayKey ||
    bonusWhackE !== todayKey ||
    bonusWhackM !== todayKey ||
    bonusWhackH !== todayKey;
  const showGamesArcade =
    !entitlements.skipGamesGrind && credits < VENDOR_REVEAL_CREDIT_COST;

  return (
    <View>
      <View className="px-4 pb-1 pt-1">
        <View
          className="overflow-hidden rounded-[26px] border border-neutral-200 bg-white"
          style={
            Platform.OS === "ios"
              ? {
                  shadowColor: "#5B21B6",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.1,
                  shadowRadius: 22,
                }
              : { elevation: 3 }
          }
        >
          <LinearGradient
            colors={["#F5F3FF", "#FFFFFF", "#FFFFFF"]}
            locations={[0, 0.45, 1]}
            className="absolute inset-0"
            pointerEvents="none"
          />

          <View className="relative px-4 pb-4 pt-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-lg bg-accent-soft">
                    <Ionicons name="compass-outline" size={16} color="#7C3AED" />
                  </View>
                  <Text className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-accent-muted">
                    InstaHelp Explore
                  </Text>
                </View>
                <Text className="mt-2.5 text-[22px] font-extrabold leading-[28px] tracking-tight text-neutral-950">
                  Vendors across India
                </Text>
                <Text className="mt-1.5 text-[13px] font-medium leading-[19px] text-neutral-600">
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
                className="overflow-hidden rounded-2xl border border-accent/10 bg-white active:opacity-90"
                style={heroCardShadow}
              >
                <View className="items-center px-3.5 py-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent-soft">
                    <Ionicons name="diamond-outline" size={18} color="#7C3AED" />
                  </View>
                  <Text className="mt-1 text-xl font-black text-neutral-900">{credits}</Text>
                  <Text className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                    credits
                  </Text>
                  {explorePlanLabel ? (
                    <Text className="mt-1 text-[8px] font-extrabold uppercase tracking-wide text-accent-deep">
                      {explorePlanLabel}
                    </Text>
                  ) : null}
                  <Ionicons name="chevron-down" size={12} color="#7C3AED" />
                </View>
              </Pressable>
            </View>

            {showGamesArcade ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open InstaHelp games arcade"
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {},
                  );
                  router.push("/(tabs)/vendors/arcade");
                }}
                className="mt-4 flex-row items-center gap-3 overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 active:opacity-90"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Ionicons name="game-controller" size={19} color="#92400e" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-extrabold text-neutral-900">
                    Low credits — earn +{GAME_OPEN_CREDIT_REWARD} in the arcade
                  </Text>
                  <Text className="mt-0.5 text-[11px] font-medium text-neutral-500">
                    {canClaimBonusCredits
                      ? "Play games to unlock more vendor contacts."
                      : "Keep playing — today's win bonuses are claimed."}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View className="mt-4">
          <View
            className="flex-row items-center rounded-2xl border border-neutral-200 bg-white px-3"
            style={
              Platform.OS === "ios"
                ? {
                    shadowColor: "#0f172a",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                  }
                : { elevation: 2 }
            }
          >
            <Ionicons name="search-outline" size={20} color="#94a3b8" />
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search business, category, or service..."
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 border-0 bg-transparent py-3.5 pl-2 pr-1 text-[15px]"
              placeholderTextColor="#94a3b8"
            />
            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch("")}
                hitSlop={10}
                accessibilityLabel="Clear search"
                className="rounded-full bg-neutral-100 p-1.5"
              >
                <Ionicons name="close-circle" size={18} color="#64748b" />
              </Pressable>
            ) : null}
          </View>

          {activeFilterCount > 0 ? (
            <View className="mt-2 flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="filter" size={13} color="#7C3AED" />
                <Text className="text-[11px] font-bold text-neutral-600">
                  {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} active
                </Text>
              </View>
              <Pressable
                onPress={clearFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
                className="flex-row items-center gap-1 rounded-full px-2 py-1 active:opacity-70"
              >
                <Ionicons name="refresh-outline" size={14} color="#7C3AED" />
                <Text className="text-[11px] font-extrabold text-accent-deep">Clear all</Text>
              </Pressable>
            </View>
          ) : null}

          <View className="mt-1">
            <ChipRail
              title="Cities"
              hint={entitlements.canUseMultiCity ? "Pro+ multi-city compare" : "Top metros & hubs"}
            >
              {entitlements.canUseMultiCity ? (
                <MarketplaceChip
                  label={`Multi-city${multiCityMode ? ` · ${multiCityKeys.length}` : ""}`}
                  active={multiCityMode}
                  icon="git-compare-outline"
                  compact
                  onPress={() => {
                    void Haptics.selectionAsync().catch(() => {});
                    onToggleMultiCityMode();
                  }}
                />
              ) : null}
              <MarketplaceChip
                label="All India"
                active={!multiCityMode && cityKey === null}
                icon="earth-outline"
                compact
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  if (multiCityMode) onToggleMultiCityMode();
                  setCityKey(null);
                  setAreaKey(null);
                }}
              />
              {cityOptions.map(([key, label]) => (
                <MarketplaceChip
                  key={key}
                  label={label}
                  active={
                    multiCityMode ? multiCityKeys.includes(key) : cityKey === key
                  }
                  icon="business-outline"
                  compact
                  onPress={() => {
                    void Haptics.selectionAsync().catch(() => {});
                    if (multiCityMode && entitlements.canUseMultiCity) {
                      onToggleMultiCityKey(key);
                      return;
                    }
                    setCityKey((cur) => (cur === key ? null : key));
                    setAreaKey(null);
                  }}
                />
              ))}
            </ChipRail>

            <ChipRail title="Areas" hint="Popular neighbourhoods">
              <MarketplaceChip
                label="All areas"
                active={areaKey === null}
                icon="globe-outline"
                compact
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  setAreaKey(null);
                }}
              />
              {areaOptions.map(([key, label]) => (
                <MarketplaceChip
                  key={key}
                  label={label}
                  active={areaKey === key}
                  icon="location-outline"
                  compact
                  onPress={() => {
                    void Haptics.selectionAsync().catch(() => {});
                    setAreaKey((cur) => (cur === key ? null : key));
                  }}
                />
              ))}
            </ChipRail>

            <ChipRail title="Smart sort & filters">
              <MarketplaceChip
                label="Nearby"
                active={sortMode === "distance"}
                icon="navigate-circle-outline"
                compact
                onPress={() => toggleSortMode("distance")}
              />
              <MarketplaceChip
                label="Top rated"
                active={sortMode === "rating"}
                icon="trophy-outline"
                compact
                onPress={() => toggleSortMode("rating")}
              />
              <MarketplaceChip
                label={entitlements.canUseVerifiedFilter ? "Verified only" : "Verified · Pro"}
                active={verifiedOnly}
                icon={
                  entitlements.canUseVerifiedFilter
                    ? "shield-checkmark-outline"
                    : "lock-closed-outline"
                }
                compact
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  if (!entitlements.canUseVerifiedFilter) {
                    onUpgrade();
                    return;
                  }
                  setVerifiedOnly((v) => !v);
                }}
              />
              <MarketplaceChip
                label="Open now · est."
                active={availableNowOnly}
                icon="partly-sunny-outline"
                compact
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  setAvailableNowOnly((v) => !v);
                }}
              />
            </ChipRail>
          </View>
        </View>

        <View className="h-2" />
      </View>
    </View>
  );
}
