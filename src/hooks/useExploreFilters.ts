import { PRO_PLUS_MULTI_CITY_LIMIT } from "@/constants/exploreEntitlements";
import {
  MARKETPLACE_AREAS,
  MARKETPLACE_CITIES,
} from "@/constants/marketplaceCatalog";
import { PERF_DEBOUNCE_MS } from "@/constants/performance";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
import { resolveExploreCatalogFilters } from "@/services/vendors/resolveExploreFilters";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

type InitialParams = {
  search?: string;
  category?: string;
};

export function useExploreFilters(initial?: InitialParams) {
  const router = useRouter();
  const { entitlements } = useExploreSubscription();

  const [search, setSearch] = useState(() => String(initial?.search ?? ""));
  const debouncedSearch = useDebouncedValue(search, PERF_DEBOUNCE_MS);

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

  const toggleSortMode = useCallback((next: "distance" | "rating") => {
    setSortMode((cur) => (cur === next ? "recommended" : next));
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
    search,
    setSearch,
    debouncedSearch,
    cityKey,
    setCityKey,
    areaKey,
    setAreaKey,
    categoryFilter,
    sortMode,
    verifiedOnly,
    setVerifiedOnly,
    availableNowOnly,
    setAvailableNowOnly,
    multiCityMode,
    multiCityKeys,
    cityLabel,
    cityOptions,
    areaOptions,
    catalogFilters,
    activeFilterCount,
    entitlements,
    promptUpgrade,
    toggleSortMode,
    clearFilters,
    onToggleMultiCityMode,
    onToggleMultiCityKey,
  };
}

export type ExploreFiltersState = ReturnType<typeof useExploreFilters>;
