import {
  BANGALORE_CITY_CENTER,
  VENDOR_REVEAL_CREDIT_COST,
} from "@/constants/vendorMarketplace";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { MarketplaceVendorCard } from "@/components/vendors/MarketplaceVendorCard";
import { MarketplaceToast } from "@/components/vendors/MarketplaceToast";
import { CreditHistoryModal } from "@/components/vendors/CreditHistoryModal";
import { EarlyAccessStrip } from "@/components/vendors/EarlyAccessStrip";
import { ExploreListHeader } from "@/components/vendors/ExploreListHeader";
import { SavedVendorsStrip } from "@/components/vendors/SavedVendorsStrip";
import { VendorExploreListSkeleton } from "@/components/vendors/VendorExploreListSkeleton";
import { PRO_PLUS_MULTI_CITY_LIMIT, isEarlyAccessCategory } from "@/constants/exploreEntitlements";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useVendorUserLocation } from "@/hooks/useVendorUserLocation";
import {
  MARKETPLACE_AREAS,
  MARKETPLACE_CITIES,
} from "@/constants/marketplaceCatalog";
import { resolveExploreCatalogFilters } from "@/services/vendors/resolveExploreFilters";
import { tryExploreReveal, exploreRevealCostLabel } from "@/services/explore/exploreRevealService";
import { canViewVendorCategory } from "@/services/explore/exploreEntitlements";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
import { useVendors } from "@/hooks/useVendors";
import type { VendorCatalogSort } from "@/services/vendors/vendorCatalogTypes";
import { haversineKm } from "@/services/vendors/vendorGeo";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";

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

export function VendorsExploreScreen() {
  const router = useRouter();
  const phone = useAuthPhone();
  const { subscription, entitlements } = useExploreSubscription();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const coords = useVendorUserLocation(true);

  const credits = useVendorLeadStore((s) => s.credits);
  const isVendorUnlocked = useVendorLeadStore((s) => s.isVendorUnlocked);

  const [search, setSearch] = useState(() => String(params.search ?? ""));
  const debouncedSearch = useDebouncedValue(search, 280);

  const [cityKey, setCityKey] = useState<string | null>(null);
  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [categoryFilter] = useState<string | null>(() =>
    params.category ? String(params.category) : null,
  );
  const [sortMode, setSortMode] = useState<
    "recommended" | "distance" | "rating"
  >("recommended");

  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [multiCityMode, setMultiCityMode] = useState(false);
  const [multiCityKeys, setMultiCityKeys] = useState<string[]>([]);

  const promptUpgrade = useCallback(
    (feature: string) => {
      Alert.alert(
        "Upgrade Explore",
        `${feature} is included with Pro and Pro+ plans.`,
        [
          { text: "Not now", style: "cancel" },
          {
            text: "View plans",
            onPress: () => router.push("/(tabs)/vendors/plans"),
          },
        ],
      );
    },
    [router],
  );

  useEffect(() => {
    if (!entitlements.canUseVerifiedFilter && verifiedOnly) {
      setVerifiedOnly(false);
    }
  }, [entitlements.canUseVerifiedFilter, verifiedOnly]);

  useEffect(() => {
    if (!entitlements.canUseMultiCity && multiCityMode) {
      setMultiCityMode(false);
      setMultiCityKeys([]);
    }
  }, [entitlements.canUseMultiCity, multiCityMode]);

  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cityLabel = useMemo(
    () => MARKETPLACE_CITIES.find((c) => c.id === cityKey)?.label ?? null,
    [cityKey],
  );

  const cityOptions = useMemo(
    () => MARKETPLACE_CITIES.map((c) => [c.id, c.label] as const),
    [],
  );

  const areaOptions = useMemo(() => {
    const pool = cityKey
      ? MARKETPLACE_AREAS.filter((a) => a.id.startsWith(`${cityKey}__`))
      : MARKETPLACE_AREAS;
    return pool.map((a) => {
      const label = cityKey ? a.label : `${a.label} · ${a.cityLabel}`;
      return [a.id, label] as const;
    });
  }, [cityKey]);

  const catalogFilters = useMemo(
    () =>
      resolveExploreCatalogFilters({
        search: debouncedSearch,
        categoryParam: categoryFilter,
      }),
    [debouncedSearch, categoryFilter],
  );

  const {
    vendors: catalogVendors,
    loading,
    refreshing,
    error,
    refresh,
    retry,
    source,
  } = useVendors({
    search: catalogFilters.search,
    areaKey,
    cityKey: multiCityMode && multiCityKeys.length > 0 ? null : cityKey,
    category: catalogFilters.category,
    city: cityLabel,
    verifiedOnly,
    availableNowOnly,
    sort: sortModeToCatalogSort(sortMode),
    userLocation: coords ?? BANGALORE_CITY_CENTER,
  });

  const revealCostLabel = useMemo(
    () => exploreRevealCostLabel(subscription),
    [subscription],
  );

  const filtered = useMemo(() => {
    let list = catalogVendors;

    if (multiCityMode && multiCityKeys.length > 0) {
      const allowed = new Set(multiCityKeys);
      list = list.filter((v) => allowed.has(v.cityKey));
    }

    if (!entitlements.canAccessEarlyCategories) {
      list = list.filter((v) => canViewVendorCategory(v.category, entitlements));
    }

    return list;
  }, [catalogVendors, entitlements, multiCityKeys, multiCityMode]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (multiCityMode && multiCityKeys.length > 0) n += 1;
    if (cityKey) n += 1;
    if (areaKey) n += 1;
    if (sortMode !== "recommended") n += 1;
    if (verifiedOnly) n += 1;
    if (availableNowOnly) n += 1;
    if (debouncedSearch.trim()) n += 1;
    return n;
  }, [
    cityKey,
    areaKey,
    sortMode,
    verifiedOnly,
    availableNowOnly,
    debouncedSearch,
    multiCityMode,
    multiCityKeys.length,
  ]);

  const sections = useMemo(() => {
    const map = new Map<string, VendorRecord[]>();
    for (const v of filtered) {
      if (
        entitlements.canAccessEarlyCategories &&
        isEarlyAccessCategory(v.category)
      ) {
        continue;
      }
      const cat = v.category.trim() || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(v);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [filtered, entitlements.canAccessEarlyCategories]);

  const explorePlanLabel =
    subscription?.status === "active"
      ? subscription.plan === "pro_plus"
        ? "Pro+"
        : subscription.plan === "pro"
          ? `Pro · ${subscription.revealsRemaining ?? 0}/wk`
          : null
      : null;

  const showToastMsg = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2700);
  }, []);

  const handleReveal = useCallback(
    async (vendorId: string) => {
      const res = await tryExploreReveal(phone, vendorId);
      if (!res.ok) {
        if (res.reason === "weekly_limit") {
          Alert.alert(
            "Weekly limit reached",
            "Your Pro plan includes 10 reveals per week. Upgrade to Pro+ for unlimited reveals, or wait until Monday.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "View plans",
                onPress: () => router.push("/(tabs)/vendors/plans"),
              },
            ],
          );
          return;
        }
        Alert.alert(
          "Not enough credits",
          `You need ${VENDOR_REVEAL_CREDIT_COST} credits to reveal a vendor.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "View plans",
              onPress: () => router.push("/(tabs)/vendors/plans"),
            },
          ],
        );
        return;
      }
      if (!res.alreadyUnlocked) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMsg(
          res.usedCredits
            ? "Unlocked! Call or WhatsApp from the profile."
            : "Unlocked with your Explore plan!",
        );
      }
    },
    [phone, router, showToastMsg],
  );

  const toggleSortMode = useCallback((next: "distance" | "rating") => {
    setSortMode((cur) => (cur === next ? "recommended" : next));
    void Haptics.selectionAsync().catch(() => {});
  }, []);

  const clearFilters = useCallback(() => {
    setCityKey(null);
    setAreaKey(null);
    setMultiCityMode(false);
    setMultiCityKeys([]);
    setSearch("");
    setVerifiedOnly(false);
    setAvailableNowOnly(false);
    setSortMode("recommended");
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const onToggleMultiCityMode = useCallback(() => {
    if (!entitlements.canUseMultiCity) {
      promptUpgrade("Multi-city marketplace access");
      return;
    }
    setMultiCityMode((on) => {
      if (on) setMultiCityKeys([]);
      return !on;
    });
    setCityKey(null);
    setAreaKey(null);
  }, [entitlements.canUseMultiCity, promptUpgrade]);

  const onToggleMultiCityKey = useCallback((key: string) => {
    setMultiCityKeys((cur) => {
      if (cur.includes(key)) {
        return cur.filter((k) => k !== key);
      }
      if (cur.length >= PRO_PLUS_MULTI_CITY_LIMIT) {
        Alert.alert(
          "City limit",
          `Pro+ supports up to ${PRO_PLUS_MULTI_CITY_LIMIT} cities at once.`,
        );
        return cur;
      }
      return [...cur, key];
    });
  }, []);

  const renderListHeader = useCallback(
    () => (
      <>
        <ExploreListHeader
          coords={coords}
          activeFilterCount={activeFilterCount}
          credits={credits}
          explorePlanLabel={explorePlanLabel}
          entitlements={entitlements}
          onUpgrade={() => promptUpgrade("This feature")}
          multiCityMode={multiCityMode}
          multiCityKeys={multiCityKeys}
          onToggleMultiCityMode={onToggleMultiCityMode}
          onToggleMultiCityKey={onToggleMultiCityKey}
          onOpenHistory={() => setHistoryOpen(true)}
          search={search}
          setSearch={setSearch}
          cityOptions={cityOptions}
          cityKey={cityKey}
          setCityKey={setCityKey}
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
        <EarlyAccessStrip
          vendors={catalogVendors}
          canAccess={entitlements.canAccessEarlyCategories}
          onReveal={(vendorId) => {
            void handleReveal(vendorId);
          }}
          isVendorUnlocked={isVendorUnlocked}
          distanceKmFromUser={(v) => distanceKmFromUser(v, coords)}
          revealCostLabel={revealCostLabel}
        />
        <SavedVendorsStrip
          vendors={catalogVendors}
          isPro={entitlements.isPro}
          savedLimit={entitlements.savedVendorLimit}
        />
      </>
    ),
    [
      coords,
      activeFilterCount,
      credits,
      explorePlanLabel,
      entitlements,
      promptUpgrade,
      multiCityMode,
      multiCityKeys,
      onToggleMultiCityMode,
      onToggleMultiCityKey,
      search,
      cityOptions,
      cityKey,
      areaOptions,
      areaKey,
      sortMode,
      toggleSortMode,
      verifiedOnly,
      availableNowOnly,
      clearFilters,
      catalogVendors,
      handleReveal,
      isVendorUnlocked,
      revealCostLabel,
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

        {loading && !filtered.length && !error ? (
          <VendorExploreListSkeleton />
        ) : error && !filtered.length ? (
          <View className="flex-1 justify-center px-6">
            <EmptyState
              title="Could not load vendors"
              subtitle={
                source === "firestore"
                  ? "Check your connection and Firebase config, then try again."
                  : "Something went wrong loading the catalog."
              }
              icon="cloud-offline-outline"
            >
              <Pressable
                onPress={retry}
                className="rounded-full bg-accent px-8 py-3.5"
              >
                <Text className="text-center text-[15px] font-extrabold text-accent-foreground">
                  Retry
                </Text>
              </Pressable>
            </EmptyState>
          </View>
        ) : (
          <SectionList
            style={{ flex: 1 }}
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor="#7C3AED"
              />
            }
            ListFooterComponent={<View className="h-6" />}
            ListHeaderComponent={renderListHeader}
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
                            shadowColor: "#7C3AED",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 6,
                          }
                        : { elevation: 2 }
                    }
                  >
                    <Ionicons name="chevron-down" size={16} color="#7C3AED" />
                  </View>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View className="px-4 pb-1">
                <MarketplaceVendorCard
                  vendor={item}
                  distanceKm={distanceKmFromUser(item, coords)}
                  unlocked={isVendorUnlocked(item.id)}
                  revealCostLabel={revealCostLabel}
                  onPressCard={() => router.push(`/(tabs)/vendors/${item.id}`)}
                  onReveal={() => {
                    void handleReveal(item.id);
                  }}
                />
              </View>
            )}
            ListEmptyComponent={
              <View className="min-h-[320px] justify-center px-5 py-10">
                <EmptyState
                  title="Nothing matches quite yet"
                  subtitle="Relax a filter or try a simpler search — the catalog spans 4,500+ vendors across India."
                  icon="search-outline"
                >
                  <Pressable
                    onPress={clearFilters}
                    className="rounded-full bg-accent px-8 py-3.5 shadow-md"
                  >
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
