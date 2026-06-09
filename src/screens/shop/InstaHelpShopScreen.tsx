import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopProductDetail } from "@/components/shop/ShopProductDetail";
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
import { useShopCatalogMeta, useShopProducts } from "@/hooks/useShopCatalog";
import { useShopSyncStatus } from "@/providers/ShopSyncProvider";
import { openAffiliateLink } from "@/services/shop/shopAffiliateLinks";
import {
  SHOP_FILTER_OPTIONS,
  SHOP_SORT_OPTIONS,
  filterShopProducts,
  getUniqueBrands,
  type ShopFilterId,
  type ShopSortId,
} from "@/services/shop/shopProductFilters";
import { sortPlatformsByPrice } from "@/services/shop/shopPriceLogic";
import type { ShopCatalogProduct } from "@/types/shopCatalog";
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

type FilterMenuId = "filter" | "sort" | "brand";

const FILTER_CHIPS: {
  id: FilterMenuId;
  label: string;
  icon: "options-outline" | "swap-vertical" | "pricetag-outline";
}[] = [
  { id: "filter", label: "Filter", icon: "options-outline" },
  { id: "sort", label: "Sort", icon: "swap-vertical" },
  { id: "brand", label: "Brand", icon: "pricetag-outline" },
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
  const products = useShopProducts();
  const { isStale, fetchFailed } = useShopCatalogMeta();
  const {
    pricesUpdatedFlash,
    clearPricesUpdatedFlash,
    retry,
  } = useShopSyncStatus();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => {
    if (pricesUpdatedFlash) {
      showToast("Prices updated");
      clearPricesUpdatedFlash();
    }
  }, [pricesUpdatedFlash, clearPricesUpdatedFlash, showToast]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const [category, setCategory] = useState<ShopCategoryId>("electronics");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<FilterMenuId | null>(null);
  const [sortBy, setSortBy] = useState<ShopSortId>("featured");
  const [activeFilters, setActiveFilters] = useState<Set<ShopFilterId>>(
    () => new Set(),
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );
  const sortedPlatforms = useMemo(
    () =>
      selectedProduct
        ? sortPlatformsByPrice(selectedProduct.platforms)
        : [],
    [selectedProduct],
  );

  const similarProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter(
        (p) =>
          p.id !== selectedProduct.id &&
          p.categoryId === selectedProduct.categoryId,
      )
      .slice(0, 6);
  }, [products, selectedProduct]);

  const categoryProducts = useMemo(
    () =>
      category === "all"
        ? products
        : products.filter((p) => p.categoryId === category),
    [category, products],
  );

  const brandOptions = useMemo(
    () => getUniqueBrands(categoryProducts),
    [categoryProducts],
  );

  const filteredProducts = useMemo(
    () =>
      filterShopProducts(products, {
        category,
        search,
        sortBy,
        filters: activeFilters,
        brand: selectedBrand,
      }),
    [products, category, search, sortBy, activeFilters, selectedBrand],
  );

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
    setSelectedBrand(null);
    setOpenMenu(null);
  }, []);

  const handleAffiliateOpen = useCallback(
    async (
      product: ShopCatalogProduct,
      platform: ShopCatalogProduct["platforms"][number],
    ) => {
      if (!platform.affiliateUrl) return;
      const result = await openAffiliateLink(
        platform.affiliateUrl,
        product.id,
        platform.platform,
      );
      if (!result.ok) {
        showToast("Could not open. Try again.");
      }
    },
    [showToast],
  );

  const addToCart = useCallback((productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  }, []);

  const incrementCart = useCallback((productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  }, []);

  const decrementCart = useCallback((productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const n = (next[productId] ?? 0) - 1;
      if (n <= 0) delete next[productId];
      else next[productId] = n;
      return next;
    });
  }, []);

  const tileWidth = useMemo(() => {
    const mainW = windowWidth - SIDEBAR_W;
    const w = mainW - GRID_H_PAD * 2 - GRID_GUTTER;
    return Math.floor(w / 2);
  }, [windowWidth]);

  const openProduct = useCallback((id: string) => {
    setSelectedProductId(id);
  }, []);

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

        {(fetchFailed && isStale) || (fetchFailed && products.length === 0) ? (
          <Pressable
            onPress={() => void retry()}
            style={styles.staleBanner}
            accessibilityRole="button"
          >
            <Ionicons name="refresh-outline" size={14} color="#92400e" />
            <Text style={styles.staleBannerText}>
              Prices may be outdated. Tap to retry.
            </Text>
          </Pressable>
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
          <View style={styles.filterBar}>
            {FILTER_CHIPS.map((chip) => {
              const isOpen = openMenu === chip.id;
              const isActive =
                chip.id === "filter"
                  ? activeFilters.size > 0
                  : chip.id === "sort"
                    ? sortBy !== "featured"
                    : selectedBrand != null;

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

          {openMenu === "filter" ? (
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
          ) : null}

          {openMenu === "sort" ? (
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
          ) : null}

          {openMenu === "brand" ? (
            <View style={styles.menuPanel}>
              <Pressable
                onPress={() => {
                  setSelectedBrand(null);
                  setOpenMenu(null);
                }}
                style={styles.menuRow}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedBrand == null }}
              >
                <Ionicons
                  name={selectedBrand == null ? "radio-button-on" : "radio-button-off"}
                  size={16}
                  color={selectedBrand == null ? SHOP_GREEN : SHOP_TEXT_LIGHT}
                />
                <Text
                  style={[
                    styles.menuRowText,
                    selectedBrand == null && styles.menuRowTextActive,
                  ]}
                >
                  All brands
                </Text>
              </Pressable>
              {brandOptions.length > 0 ? (
                brandOptions.map((brand) => {
                  const on = selectedBrand === brand;
                  return (
                    <Pressable
                      key={brand}
                      onPress={() => {
                        setSelectedBrand(brand);
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
                        {brand}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.menuEmptyText}>
                  No brands in this category yet.
                </Text>
              )}
            </View>
          ) : null}

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
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
                <Text style={styles.emptyTitle}>
                  {products.length === 0 ? "No products yet" : "No matches"}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {products.length === 0
                    ? "Publish the Google Sheet with active rows."
                    : activeFilters.size > 0 || selectedBrand || sortBy !== "featured"
                      ? "Try clearing filters or changing sort."
                      : "Try another category or search."}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <ShopProductCard
                product={item}
                width={tileWidth}
                qtyInCart={cart[item.id] ?? 0}
                onOpen={() => openProduct(item.id)}
                onAdd={() => addToCart(item.id)}
                onIncrement={() => incrementCart(item.id)}
                onDecrement={() => decrementCart(item.id)}
              />
            )}
          />
        </View>
      </View>

      {selectedProduct ? (
        <ShopProductDetail
          key={selectedProduct.id}
          product={selectedProduct}
          similarProducts={similarProducts}
          sortedPlatforms={sortedPlatforms}
          qtyInCart={cart[selectedProduct.id] ?? 0}
          cart={cart}
          onClose={() => setSelectedProductId(null)}
          onAddToCart={() => addToCart(selectedProduct.id)}
          onIncrement={() => incrementCart(selectedProduct.id)}
          onDecrement={() => decrementCart(selectedProduct.id)}
          onOpenProduct={openProduct}
          onAffiliateOpen={(platform) =>
            void handleAffiliateOpen(selectedProduct, platform)
          }
          onGridAdd={addToCart}
          onGridIncrement={incrementCart}
          onGridDecrement={decrementCart}
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
  staleBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  staleBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#92400e",
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
  menuEmptyText: {
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_MUTED,
    paddingVertical: 6,
    paddingHorizontal: 4,
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
