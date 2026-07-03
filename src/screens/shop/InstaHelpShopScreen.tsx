import { ALL_SHOP_APPS, getShopAppById } from "@/apps";
import { ShopAppDetail } from "@/components/shop/ShopAppDetail";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { Screen } from "@/components/ui/Screen";
import { MarketplaceToast } from "@/components/vendors/MarketplaceToast";
import {
  SHOP_CATEGORIES,
  type ShopCategoryId,
} from "@/constants/shop";
import {
  SHOP_GREEN,
  SHOP_GREEN_LIGHT,
  SHOP_TEXT,
  SHOP_TEXT_LIGHT,
  SHOP_TEXT_MUTED,
} from "@/constants/shopTheme";
import { DealCard } from "@/features/deals/components/DealCard";
import { useDealSearch } from "@/features/deals/hooks/useDeals";
import { DealDetailScreen } from "@/features/deals/screens/DealDetailScreen";
import { DealsHomeScreen } from "@/features/deals/screens/DealsHomeScreen";
import {
  filterDeals,
  getDealById,
  trackDealClick,
} from "@/features/deals/services/dealsService";
import type { Deal } from "@/features/deals/types/dealTypes";
import {
  filterShopApps,
  getSimilarApps,
} from "@/services/shop/shopAppFilters";
import { openAppLink } from "@/services/shop/shopAppLinks";
import {
  initializeCuelinks,
  openCuelinksAffiliateLink,
} from "@/services/cuelinksService";
import {
  SHOP_FILTER_OPTIONS,
  SHOP_SORT_OPTIONS,
  type ShopFilterId,
  type ShopSortId,
} from "@/services/shop/shopProductFilters";
import type { ShopApp } from "@/types/shopApp";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterMenuId = "filter" | "sort";

type SearchRow =
  | { kind: "deal"; deal: Deal; key: string }
  | { kind: "app"; app: ShopApp; key: string };

const FILTER_CHIPS: {
  id: FilterMenuId;
  label: string;
  icon: "options-outline" | "swap-vertical";
}[] = [
  { id: "filter", label: "Filter", icon: "options-outline" },
  { id: "sort", label: "Sort", icon: "swap-vertical" },
];
const SIDEBAR_W = 52;
const GRID_H_PAD = 8;
const GRID_GUTTER = 8;

function categoryLabel(category: ShopCategoryId) {
  return SHOP_CATEGORIES.find((c) => c.id === category)?.label ?? "All";
}

export function InstaHelpShopScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => {
    initializeCuelinks();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const [category, setCategory] = useState<ShopCategoryId>("all");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<FilterMenuId | null>(null);
  const [sortBy, setSortBy] = useState<ShopSortId>("featured");
  const [activeFilters, setActiveFilters] = useState<Set<ShopFilterId>>(
    () => new Set(),
  );

  const isDealsCategory = category === "deals-offers";
  const isSearchActive = search.trim().length > 0;

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const selectedApp = useMemo(
    () => getShopAppById(selectedAppId ?? "") ?? null,
    [selectedAppId],
  );
  const selectedDeal = useMemo(() => {
    if (!selectedDealId) return null;
    return getDealById(selectedDealId) ?? null;
  }, [selectedDealId]);

  const dealSearchQuery = useDealSearch(search, isSearchActive);

  const similarApps = useMemo(() => {
    if (!selectedApp) return [];
    return getSimilarApps(ALL_SHOP_APPS, selectedApp);
  }, [selectedApp]);

  const filteredApps = useMemo(
    () =>
      filterShopApps(ALL_SHOP_APPS, {
        category: isSearchActive ? "all" : category,
        search,
        sortBy,
        filters: activeFilters,
      }),
    [category, search, sortBy, activeFilters, isSearchActive],
  );

  const filteredDeals = useMemo(() => {
    if (!isSearchActive) {
      if (isDealsCategory) return [];
      return filterDeals(dealSearchQuery.data ?? [], {
        category,
        search: "",
      });
    }
    return dealSearchQuery.data ?? [];
  }, [
    isSearchActive,
    isDealsCategory,
    dealSearchQuery.data,
    category,
  ]);

  const searchResults = useMemo((): SearchRow[] => {
    if (!isSearchActive) return [];
    const deals = filteredDeals.map((deal) => ({
      kind: "deal" as const,
      deal,
      key: `deal-${deal.id}`,
    }));
    const apps = filteredApps.map((app) => ({
      kind: "app" as const,
      app,
      key: `app-${app.id}`,
    }));
    return [...deals, ...apps];
  }, [isSearchActive, filteredDeals, filteredApps]);

  const toggleFilter = useCallback((id: ShopFilterId) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters(new Set());
    setOpenMenu(null);
  }, []);

  const selectCategory = useCallback((id: ShopCategoryId) => {
    setCategory(id);
    setSearch("");
    setOpenMenu(null);
  }, []);

  const tileWidth = useMemo(() => {
    const mainW = windowWidth - SIDEBAR_W;
    const w = mainW - GRID_H_PAD * 2 - GRID_GUTTER;
    return Math.floor(w / 2);
  }, [windowWidth]);

  const openApp = useCallback((id: string) => {
    setSelectedDealId(null);
    setSelectedAppId(id);
  }, []);

  const openDeal = useCallback((id: string) => {
    setSelectedAppId(null);
    setSelectedDealId(id);
  }, []);

  const handleAppOpen = useCallback(
    async (appId: string, websiteUrl: string) => {
      const result = await openAppLink(websiteUrl, appId);
      if (!result.ok) {
        showToast("Could not open. Try again.");
      }
    },
    [showToast],
  );

  const handleDealOpen = useCallback(
    async (deal: Deal) => {
      await trackDealClick(deal.id, deal.merchant);
      const result = await openCuelinksAffiliateLink(deal.affiliateUrl, deal.id);
      if (!result.ok) {
        showToast("Could not open offer. Try again.");
      }
    },
    [showToast],
  );

  const renderSearchRow = useCallback(
    ({ item }: { item: SearchRow }) => {
      if (item.kind === "deal") {
        return (
          <DealCard
            deal={item.deal}
            width={tileWidth}
            onOpen={() => openDeal(item.deal.id)}
            onGetDeal={() => void handleDealOpen(item.deal)}
          />
        );
      }
      return (
        <ShopProductCard
          variant="app"
          app={item.app}
          width={tileWidth}
          onOpen={() => openApp(item.app.id)}
          onOpenApp={() => void handleAppOpen(item.app.id, item.app.websiteUrl)}
        />
      );
    },
    [tileWidth, openDeal, openApp, handleDealOpen, handleAppOpen],
  );

  return (
    <Screen className="bg-white">
      {toast ? <MarketplaceToast message={toast} key={toast} /> : null}

      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{categoryLabel(category)}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setSearchOpen((v) => !v)}
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Search"
            >
              <Ionicons name="search-outline" size={22} color={SHOP_TEXT} />
            </Pressable>
            <Pressable
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Share"
            >
              <Ionicons name="share-social-outline" size={22} color={SHOP_TEXT} />
            </Pressable>
          </View>
        </View>

        {searchOpen ? (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={SHOP_TEXT_MUTED} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Search ${categoryLabel(category)}`}
              placeholderTextColor={SHOP_TEXT_LIGHT}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={SHOP_TEXT_LIGHT} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.mainRow}>
        <ScrollView
          style={styles.sidebar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
          {SHOP_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => selectCategory(cat.id)}
                style={[styles.sideItem, active && styles.sideItemActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={cat.label}
              >
                {active ? <View style={styles.sideActiveBar} /> : null}
                <View
                  style={[
                    styles.sideIconWrap,
                    active && styles.sideIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={18}
                    color={active ? SHOP_GREEN : SHOP_TEXT_MUTED}
                  />
                </View>
                <Text
                  style={[styles.sideLabel, active && styles.sideLabelActive]}
                  numberOfLines={2}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.productsPane}>
          {!isDealsCategory || isSearchActive ? (
            <View style={styles.filterBar}>
              {FILTER_CHIPS.map((chip) => {
                const isOpen = openMenu === chip.id;
                const isActive =
                  chip.id === "filter"
                    ? activeFilters.size > 0
                    : sortBy !== "featured";

                return (
                  <Pressable
                    key={chip.id}
                    onPress={() =>
                      setOpenMenu((prev) => (prev === chip.id ? null : chip.id))
                    }
                    style={[
                      styles.filterChip,
                      (isOpen || isActive) && styles.filterChipActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={chip.label}
                    accessibilityState={{ expanded: isOpen }}
                  >
                    <Ionicons
                      name={chip.icon}
                      size={9}
                      color={isOpen || isActive ? SHOP_GREEN : SHOP_TEXT_MUTED}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        (isOpen || isActive) && styles.filterChipTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={8}
                      color={isOpen || isActive ? SHOP_GREEN : SHOP_TEXT_LIGHT}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {!isDealsCategory || isSearchActive ? (
            openMenu === "filter" ? (
              <View style={styles.menuPanel}>
                {SHOP_FILTER_OPTIONS.map((opt) => {
                  const on = activeFilters.has(opt.id);
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => toggleFilter(opt.id)}
                      style={styles.menuRow}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                    >
                      <Ionicons
                        name={on ? "checkbox" : "square-outline"}
                        size={16}
                        color={on ? SHOP_GREEN : SHOP_TEXT_LIGHT}
                      />
                      <Text style={styles.menuRowText}>{opt.label}</Text>
                    </Pressable>
                  );
                })}
                {activeFilters.size > 0 ? (
                  <Pressable onPress={clearFilters} style={styles.menuClearBtn}>
                    <Text style={styles.menuClearText}>Clear filters</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null
          ) : null}

          {!isDealsCategory || isSearchActive ? (
            openMenu === "sort" ? (
              <View style={styles.menuPanel}>
                {SHOP_SORT_OPTIONS.map((opt) => {
                  const on = sortBy === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => {
                        setSortBy(opt.id);
                        setOpenMenu(null);
                      }}
                      style={styles.menuRow}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                    >
                      <Ionicons
                        name={on ? "radio-button-on" : "radio-button-off"}
                        size={16}
                        color={on ? SHOP_GREEN : SHOP_TEXT_LIGHT}
                      />
                      <Text
                        style={[styles.menuRowText, on && styles.menuRowTextActive]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null
          ) : null}

          {isDealsCategory && !isSearchActive ? (
            <DealsHomeScreen
              onOpenDeal={openDeal}
              onGetDeal={(deal) => void handleDealOpen(deal)}
              bottomInset={insets.bottom}
            />
          ) : (
            <FlatList
              data={isSearchActive ? searchResults : filteredApps}
              keyExtractor={(item) =>
                isSearchActive
                  ? (item as SearchRow).key
                  : (item as ShopApp).id
              }
              numColumns={2}
              showsVerticalScrollIndicator={false}
              style={styles.productList}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={[
                styles.gridContent,
                { paddingBottom: 100 + insets.bottom },
              ]}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={28} color={SHOP_TEXT_LIGHT} />
                  <Text style={styles.emptyTitle}>No matches</Text>
                  <Text style={styles.emptySubtitle}>
                    {dealSearchQuery.isFetching
                      ? "Searching deals and apps…"
                      : activeFilters.size > 0 || sortBy !== "featured"
                        ? "Try clearing filters or changing sort."
                        : "Try another category or search."}
                  </Text>
                </View>
              }
              renderItem={
                isSearchActive
                  ? renderSearchRow
                  : ({ item }) => (
                      <ShopProductCard
                        variant="app"
                        app={item as ShopApp}
                        width={tileWidth}
                        onOpen={() => openApp((item as ShopApp).id)}
                        onOpenApp={() =>
                          void handleAppOpen(
                            (item as ShopApp).id,
                            (item as ShopApp).websiteUrl,
                          )
                        }
                      />
                    )
              }
            />
          )}
        </View>
      </View>

      {selectedApp ? (
        <ShopAppDetail
          key={selectedApp.id}
          app={selectedApp}
          similarApps={similarApps}
          onClose={() => setSelectedAppId(null)}
          onOpenApp={() =>
            void handleAppOpen(selectedApp.id, selectedApp.websiteUrl)
          }
          onOpenAppDetail={openApp}
          onGridOpenApp={(app) =>
            void handleAppOpen(app.id, app.websiteUrl)
          }
        />
      ) : null}

      {selectedDeal ? (
        <DealDetailScreen
          key={selectedDeal.id}
          deal={selectedDeal}
          allDeals={dealSearchQuery.data ?? undefined}
          onClose={() => setSelectedDealId(null)}
          onShopNow={() => void handleDealOpen(selectedDeal)}
          onOpenDeal={openDeal}
          onGridShopNow={(deal) => void handleDealOpen(deal)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerIconBtn: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: SHOP_TEXT,
    padding: 0,
    margin: 0,
  },
  mainRow: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: SIDEBAR_W,
    flexShrink: 0,
    flexGrow: 0,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
    backgroundColor: "#ffffff",
  },
  sideItem: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 2,
    position: "relative",
  },
  sideItemActive: {
    backgroundColor: SHOP_GREEN_LIGHT,
  },
  sideActiveBar: {
    position: "absolute",
    left: 0,
    top: 6,
    bottom: 6,
    width: 2,
    borderRadius: 1,
    backgroundColor: SHOP_GREEN,
  },
  sideIconWrap: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  sideIconWrapActive: {
    backgroundColor: "#ffffff",
  },
  sideLabel: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "600",
    color: SHOP_TEXT_MUTED,
    textAlign: "center",
    lineHeight: 10,
    width: SIDEBAR_W - 4,
  },
  sideLabelActive: {
    color: SHOP_GREEN,
    fontWeight: "800",
  },
  productsPane: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#ffffff",
  },
  productList: {
    flex: 1,
  },
  filterBar: {
    flexDirection: "row",
    flexGrow: 0,
    flexShrink: 0,
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  filterChipActive: {
    borderColor: SHOP_GREEN,
    backgroundColor: SHOP_GREEN_LIGHT,
  },
  filterChipText: {
    fontSize: 9,
    fontWeight: "600",
    color: SHOP_TEXT,
    includeFontPadding: false,
    lineHeight: 11,
  },
  filterChipTextActive: {
    color: SHOP_GREEN,
    fontWeight: "700",
  },
  menuPanel: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fafafa",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  menuRowText: {
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT,
  },
  menuRowTextActive: {
    color: SHOP_GREEN,
    fontWeight: "800",
  },
  menuClearBtn: {
    alignSelf: "flex-start",
    marginTop: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  menuClearText: {
    fontSize: 11,
    fontWeight: "700",
    color: SHOP_GREEN,
  },
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: GRID_H_PAD,
  },
  gridContent: {
    paddingTop: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT_MUTED,
    textAlign: "center",
  },
});
