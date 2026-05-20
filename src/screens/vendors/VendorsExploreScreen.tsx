import {
  ARCADE_DAILY_BONUS_CREDITS_TOTAL,
  BANGALORE_CITY_CENTER,
  VENDOR_REVEAL_CREDIT_COST,
} from "@/constants/vendorMarketplace";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { MarketplaceChip } from "@/components/vendors/MarketplaceChip";
import { MarketplaceVendorCard } from "@/components/vendors/MarketplaceVendorCard";
import { MarketplaceToast } from "@/components/vendors/MarketplaceToast";
import { CreditHistoryModal } from "@/components/vendors/CreditHistoryModal";
import { VendorExploreListSkeleton } from "@/components/vendors/VendorExploreListSkeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useVendorUserLocation } from "@/hooks/useVendorUserLocation";
import { getVendorCatalog } from "@/services/vendors/localVendorCatalog";
import type { VendorCatalogSort } from "@/services/vendors/vendorCatalogTypes";
import { haversineKm } from "@/services/vendors/vendorGeo";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { calendarDayKey } from "@/utils/calendarDay";
import { hasBurnedLeadCredits } from "@/utils/vendorLeadEligibility";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

function distanceKmFromUser(
  v: VendorRecord,
  user: { lat: number; lng: number } | null,
): number | null {
  const base = user ?? BANGALORE_CITY_CENTER;
  if (!v.coordinates) return null;
  return haversineKm(base, v.coordinates);
}

function sortModeToCatalogSort(
  mode: "recommended" | "distance" | "rating",
): VendorCatalogSort {
  if (mode === "distance") return "distance";
  if (mode === "rating") return "rating";
  return "recommended";
}

type ExploreHeaderOuterProps = {
  windowWidth: number;
  coords: { lat: number; lng: number } | null;
  totalCatalogCount: number;
  filteredLen: number;
  activeFilterCount: number;
  credits: number;
  onOpenHistory: () => void;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  areaOptions: [string, string][];
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

function ExploreListHeaderAnimated(props: ExploreHeaderOuterProps) {
  const heroCardShadow =
    Platform.OS === "ios"
      ? {
          shadowColor: "#003a85",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        }
      : { elevation: 4 };

  const {
    windowWidth,
    coords,
    totalCatalogCount,
    filteredLen,
    activeFilterCount,
    credits,
    onOpenHistory,
    search,
    setSearch,
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
  const showEarnMiniGame = useVendorLeadStore((s) =>
    hasBurnedLeadCredits(s.transactions),
  );

  return (
    <Animated.View entering={FadeInDown.delay(40).springify().damping(18)}>
      <View className="px-4 pb-1 pt-1">
        <LinearGradient
          colors={["#dde7fb", "#e8eef8", "#f0f4fc"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: Math.min(420, windowWidth * 0.92),
          }}
          pointerEvents="none"
        />

        <View className="overflow-hidden rounded-[26px] border border-white/70 bg-white/75">
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(248,251,255,0.88)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />

          <View
            pointerEvents="none"
            className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-accent/10"
            style={{ opacity: 0.9 }}
          />
          <View
            pointerEvents="none"
            className="absolute bottom-2 left-0 h-24 w-24 rounded-full bg-brand-gold/15"
            style={{ transform: [{ translateX: -32 }] }}
          />

          <View className="relative px-4 pb-5 pt-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="max-w-[68%]">
                <Text className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-accent-muted">
                  InstaHelp explore
                </Text>
                <Text className="mt-2 text-[22px] font-extrabold leading-[28px] text-neutral-950">
                  Find trusted Bengaluru vendors
                </Text>
                <Text className="mt-2 text-[13px] font-medium leading-[19px] text-neutral-600">
                  {coords
                    ? "Sorted using your GPS + premium credit unlocks."
                    : "Fine-tuned for Koramangala, HSR, Whitefield & hotspots."}{" "}
                  <Text className="font-extrabold text-accent-deep">
                    {totalCatalogCount.toLocaleString("en-IN")}
                  </Text>{" "}
                  listings in curated areas.
                </Text>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <View
                    className="flex-row items-center gap-1.5 rounded-full border border-accent/15 bg-accent-soft px-3 py-1.5"
                    style={heroCardShadow}
                  >
                    <Ionicons name="ribbon-outline" size={14} color="#004aad" />
                    <Text className="text-[11px] font-extrabold text-accent-deep">
                      {filteredLen.toLocaleString("en-IN")} showing now
                    </Text>
                  </View>
                  {activeFilterCount > 0 ? (
                    <View className="flex-row items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5">
                      <Ionicons name="filter" size={13} color="#525252" />
                      <Text className="text-[11px] font-bold text-neutral-700">
                        {activeFilterCount} filter
                        {activeFilterCount === 1 ? "" : "s"} on
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <Pressable
                onPress={onOpenHistory}
                accessibilityRole="button"
                accessibilityLabel="View credit history"
                className="overflow-hidden rounded-2xl border border-accent/20 active:opacity-90"
                style={heroCardShadow}
              >
                <LinearGradient
                  colors={["#004aad", "#1e56c9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="items-center px-3.5 py-3"
                >
                  <Ionicons name="diamond-outline" size={18} color="#ffd500" />
                  <Text className="mt-1 text-xl font-black text-white">
                    {credits}
                  </Text>
                  <Text className="text-[9px] font-bold uppercase tracking-widest text-white/85">
                    credits
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="#ffffff" />
                </LinearGradient>
              </Pressable>
            </View>

            {showEarnMiniGame ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open bonus credit mini-game"
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {},
                  );
                  router.push("/(tabs)/vendors/earn-game");
                }}
                className="mt-4 flex-row items-center gap-3 overflow-hidden rounded-2xl border border-accent/20 bg-accent-soft/40 px-4 py-3 active:opacity-90"
                style={
                  Platform.OS === "ios"
                    ? {
                        shadowColor: "#004aad",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                      }
                    : { elevation: 2 }
                }
              >
                <LinearGradient
                  colors={["#ffd500", "#f5c542"]}
                  className="h-11 w-11 items-center justify-center rounded-xl"
                >
                  <Ionicons name="game-controller" size={20} color="#1a1a1a" />
                </LinearGradient>
                <View className="flex-1">
                  <Text className="text-[14px] font-extrabold text-neutral-900">
                    Arcade · up to {ARCADE_DAILY_BONUS_CREDITS_TOTAL} credits/day
                  </Text>
                  <Text className="mt-0.5 text-[11px] font-semibold text-neutral-600">
                    {canClaimBonusCredits
                      ? "Grid + Hangman +10 each · Whack tiers +5 / +10 / +15 per win."
                      : "Today's arcade payouts claimed — practise any game freely."}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#004aad" />
              </Pressable>
            ) : null}

            <View
              className="mt-5 flex-row items-center rounded-2xl border border-neutral-100 bg-white px-3"
              style={
                Platform.OS === "ios"
                  ? {
                      shadowColor: "#0f172a",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.08,
                      shadowRadius: 16,
                    }
                  : { elevation: 3 }
              }
            >
              <Ionicons name="search-outline" size={21} color="#94a3b8" />
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search business, category, or service..."
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 border-0 bg-transparent py-4 pl-2 pr-1 text-[15px]"
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

            <ChipRail title="Areas" hint="Bangalore hotspots">
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
                label="Verified only"
                active={verifiedOnly}
                icon="shield-checkmark-outline"
                compact
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
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

            {activeFilterCount > 0 ? (
              <Pressable
                onPress={clearFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
                className="mt-2 flex-row items-center justify-center gap-2 self-start rounded-full border border-dashed border-neutral-300 px-4 py-2 active:bg-neutral-50"
              >
                <Ionicons name="refresh-outline" size={16} color="#004aad" />
                <Text className="text-[12px] font-extrabold text-accent-deep">
                  Clear all filters
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Pull categories slightly away from hero so sticky headers never feel “blocked” */}
        <View className="h-2" />
      </View>
    </Animated.View>
  );
}

export function VendorsExploreScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const catalog = useMemo(() => getVendorCatalog(), []);
  const coords = useVendorUserLocation(true);

  const credits = useVendorLeadStore((s) => s.credits);
  const tryRevealVendor = useVendorLeadStore((s) => s.tryRevealVendor);
  const isVendorUnlocked = useVendorLeadStore((s) => s.isVendorUnlocked);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 280);

  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<
    "recommended" | "distance" | "rating"
  >("recommended");

  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNowOnly, setAvailableNowOnly] = useState(false);

  const [booting, setBooting] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 420);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const areaOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of catalog.getAll()) {
      m.set(v.areaKey, v.areaLabel);
    }
    return Array.from(m.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );
  }, [catalog]);

  const totalCatalogCount = catalog.getAll().length;

  const filtered = useMemo(() => {
    return catalog.query({
      search: debouncedSearch,
      areaKey,
      verifiedOnly,
      availableNowOnly,
      sort: sortModeToCatalogSort(sortMode),
      userLocation: coords ?? BANGALORE_CITY_CENTER,
    });
  }, [
    catalog,
    debouncedSearch,
    areaKey,
    verifiedOnly,
    availableNowOnly,
    sortMode,
    coords,
  ]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (areaKey) n += 1;
    if (sortMode !== "recommended") n += 1;
    if (verifiedOnly) n += 1;
    if (availableNowOnly) n += 1;
    if (debouncedSearch.trim()) n += 1;
    return n;
  }, [
    areaKey,
    sortMode,
    verifiedOnly,
    availableNowOnly,
    debouncedSearch,
  ]);

  const sections = useMemo(() => {
    const map = new Map<string, VendorRecord[]>();
    for (const v of filtered) {
      const cat = v.category.trim() || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(v);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const showToastMsg = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2700);
  }, []);

  const handleReveal = useCallback(
    (vendorId: string) => {
      const res = tryRevealVendor(vendorId);
      if (!res.ok) {
        Alert.alert(
          "Not enough credits",
          `You need ${VENDOR_REVEAL_CREDIT_COST} credits to reveal a vendor. Paid top-ups are on the way.`,
        );
        return;
      }
      if (!res.alreadyUnlocked) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMsg("Unlocked! Call or WhatsApp from the profile.");
      }
    },
    [tryRevealVendor, showToastMsg],
  );

  const toggleSortMode = useCallback(
    (next: "distance" | "rating") => {
      setSortMode((cur) => (cur === next ? "recommended" : next));
      void Haptics.selectionAsync().catch(() => {});
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setAreaKey(null);
    setSearch("");
    setVerifiedOnly(false);
    setAvailableNowOnly(false);
    setSortMode("recommended");
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {},
    );
  }, []);

  const ListHeaderComponent = useCallback(
    () => (
      <ExploreListHeaderAnimated
        windowWidth={windowWidth}
        coords={coords}
        totalCatalogCount={totalCatalogCount}
        filteredLen={filtered.length}
        activeFilterCount={activeFilterCount}
        credits={credits}
        onOpenHistory={() => setHistoryOpen(true)}
        search={search}
        setSearch={setSearch}
        areaOptions={areaOptions}
        areaKey={areaKey}
        setAreaKey={setAreaKey}
        sortMode={sortMode}
        toggleSortMode={toggleSortMode}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        availableNowOnly={availableNowOnly}
        setAvailableNowOnly={setAvailableNowOnly}
        clearFilters={clearFilters}
      />
    ),
    [
      windowWidth,
      coords,
      totalCatalogCount,
      filtered.length,
      activeFilterCount,
      credits,
      search,
      areaOptions,
      areaKey,
      sortMode,
      toggleSortMode,
      verifiedOnly,
      availableNowOnly,
      clearFilters,
    ],
  );

  return (
    <Screen className="bg-[#eef2fb]">
      <View className="flex-1">
        {toast ? <MarketplaceToast message={toast} key={toast} /> : null}
        <CreditHistoryModal
          visible={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />

        {booting ? (
          <VendorExploreListSkeleton />
        ) : (
          <SectionList
            style={{ flex: 1 }}
            sections={sections}
            keyExtractor={(item) => item.id}
            /** Sticky headers + separate hero sibling caused touch/scroll clashes on several devices — keep headers in-flow */
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListHeaderComponent={ListHeaderComponent}
            renderSectionHeader={({ section }) => (
              <View className="border-b border-neutral-200/70 bg-[#eef2fb] px-4 pb-3 pt-5">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-1.5 rounded-full bg-accent" />
                  <View className="flex-1">
                    <Text className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent-muted">
                      Category
                    </Text>
                    <Text className="mt-0.5 text-[17px] font-extrabold text-neutral-900">
                      {section.title}
                    </Text>
                    <Text className="mt-1 text-[12px] font-semibold text-neutral-500">
                      Scroll for{" "}
                      {section.data.length === 1
                        ? "1 vendor card"
                        : `${section.data.length} vendor cards`}{" "}
                      below
                    </Text>
                  </View>
                  <View
                    className="rounded-2xl border border-accent/15 bg-white px-3 py-2"
                    style={
                      Platform.OS === "ios"
                        ? {
                            shadowColor: "#004aad",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 6,
                          }
                        : { elevation: 2 }
                    }
                  >
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color="#004aad"
                    />
                  </View>
                </View>
              </View>
            )}
            renderItem={({ item, index }) => (
              <View className="px-4 pb-1">
                <MarketplaceVendorCard
                  vendor={item}
                  index={index}
                  distanceKm={distanceKmFromUser(item, coords)}
                  unlocked={isVendorUnlocked(item.id)}
                  onPressCard={() => router.push(`/(tabs)/vendors/${item.id}`)}
                  onReveal={() => handleReveal(item.id)}
                />
              </View>
            )}
            ListEmptyComponent={
              <View className="min-h-[320px] justify-center px-5 py-10">
                <EmptyState
                  title="Nothing matches quite yet"
                  subtitle="Relax a filter or try a simpler search — this catalog spans many categories across Bengaluru hotspots."
                  icon="search-outline"
                >
                  <Pressable onPress={clearFilters} className="rounded-full bg-accent px-8 py-3.5 shadow-md">
                    <Text className="text-center text-[15px] font-extrabold text-accent-foreground">
                      Reset everything
                    </Text>
                  </Pressable>
                </EmptyState>
              </View>
            }
            contentContainerStyle={{
              paddingBottom: Platform.OS === "ios" ? 160 : 150,
              flexGrow: 1,
              backgroundColor: "#eef2fb",
            }}
            initialNumToRender={12}
            maxToRenderPerBatch={22}
            windowSize={10}
          />
        )}
      </View>
    </Screen>
  );
}

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
