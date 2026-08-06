import {
  BANGALORE_CITY_CENTER,
  VENDOR_REVEAL_CREDIT_COST,
} from "@/constants/vendorMarketplace";
import { PRO_PLUS_MULTI_CITY_LIMIT, isEarlyAccessCategory } from "@/constants/exploreEntitlements";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useVendorUserLocation } from "@/hooks/useVendorUserLocation";
import {
  MARKETPLACE_AREAS,
  MARKETPLACE_CITIES,
} from "@/constants/marketplaceCatalog";
import { resolveExploreCatalogFilters } from "@/services/vendors/resolveExploreFilters";
import { tryExploreReveal, exploreRevealCostLabel } from "@/services/explore/exploreRevealService";
import { alertInsufficientCredits } from "@/services/ads/alertInsufficientCredits";
import { canViewVendorCategory } from "@/services/explore/exploreEntitlements";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
import { useVendors } from "@/hooks/useVendors";
import type { VendorCatalogSort } from "@/services/vendors/vendorCatalogTypes";
import { haversineKm } from "@/services/vendors/vendorGeo";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import type { VendorRecord } from "@/types/vendorMarketplace";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

function sortModeToCatalogSort(
  mode: "recommended" | "distance" | "rating",
): VendorCatalogSort {
  if (mode === "distance") return "distance";
  if (mode === "rating") return "rating";
  return "recommended";
}

export function distanceKmFromUser(
  v: VendorRecord,
  user: { lat: number; lng: number } | null,
): number | null {
  const base = user ?? BANGALORE_CITY_CENTER;
  if (!v.coordinates) return null;
  return haversineKm(base, v.coordinates);
}

type InitialParams = {
  search?: string;
  category?: string;
};

export function useExploreCatalog(initial?: InitialParams) {
  const router = useRouter();
  const phone = useAuthPhone();
  const { subscription, entitlements } = useExploreSubscription();
  const coords = useVendorUserLocation(true);

  const credits = useVendorLeadStore((s) => s.credits);
  const isVendorUnlocked = useVendorLeadStore((s) => s.isVendorUnlocked);

  const [search, setSearch] = useState(() => String(initial?.search ?? ""));
  const debouncedSearch = useDebouncedValue(search, 280);

  const [cityKey, setCityKey] = useState<string | null>(null);
  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(() =>
    initial?.category ? String(initial.category) : null,
  );
  const [sortMode, setSortMode] = useState<
    "recommended" | "distance" | "rating"
  >("recommended");

  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [multiCityMode, setMultiCityMode] = useState(false);
  const [multiCityKeys, setMultiCityKeys] = useState<string[]>([]);

  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (initial?.search) setSearch(String(initial.search));
  }, [initial?.search]);

  useEffect(() => {
    if (initial?.category) setCategoryFilter(String(initial.category));
  }, [initial?.category]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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
      .map(([title, data]) => {
        const rated = data.filter((v) => v.rating > 0);
        const avgRating =
          rated.length > 0
            ? rated.reduce((sum, v) => sum + v.rating, 0) / rated.length
            : null;
        const verifiedCount = data.filter((v) => v.isVerified).length;
        return {
          title,
          data,
          avgRating,
          verifiedCount,
        };
      });
  }, [filtered, entitlements.canAccessEarlyCategories]);

  const resultSummary = useMemo(() => {
    const vendorCount = filtered.length;
    const categoryCount = sections.length;
    return { vendorCount, categoryCount };
  }, [filtered.length, sections.length]);

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
        alertInsufficientCredits({
          needCredits: VENDOR_REVEAL_CREDIT_COST,
          onOpenPlans: () => router.push("/(tabs)/vendors/plans"),
          onOpenCredits: () => setHistoryOpen(true),
        });
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

  return {
    coords,
    credits,
    isVendorUnlocked,
    search,
    setSearch,
    cityKey,
    setCityKey,
    areaKey,
    setAreaKey,
    sortMode,
    verifiedOnly,
    setVerifiedOnly,
    availableNowOnly,
    setAvailableNowOnly,
    multiCityMode,
    multiCityKeys,
    toast,
    historyOpen,
    setHistoryOpen,
    entitlements,
    explorePlanLabel,
    promptUpgrade,
    cityOptions,
    areaOptions,
    catalogVendors,
    loading,
    refreshing,
    error,
    refresh,
    retry,
    source,
    revealCostLabel,
    filtered,
    activeFilterCount,
    sections,
    resultSummary,
    handleReveal,
    toggleSortMode,
    clearFilters,
    onToggleMultiCityMode,
    onToggleMultiCityKey,
  };
}

export type ExploreCatalogState = ReturnType<typeof useExploreCatalog>;
