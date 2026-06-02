import { Screen } from "@/components/ui/Screen";
import {
  SHOP_CATEGORIES,
  type ShopCategoryId,
} from "@/constants/shop";
import {
  SHOP_MOCK_PRODUCTS,
  type ShopProduct,
} from "@/constants/shopMockProducts";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";

function formatINR(n: number) {
  try {
    return n.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  } catch {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
}

function categoryLabel(category: ShopCategoryId) {
  return SHOP_CATEGORIES.find((c) => c.id === category)?.label ?? "All";
}

function initialsFromTitle(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function getSearchPlaceholder(category: ShopCategoryId) {
  if (category === "all") return "Search products (mock catalog)";
  return `Search ${categoryLabel(category)} (mock catalog)`;
}

function ProductTile({
  product,
  qtyInCart,
  onAdd,
  onOpen,
}: {
  product: ShopProduct;
  qtyInCart: number;
  onAdd: () => void;
  onOpen: () => void;
}) {
  const initials = initialsFromTitle(product.title);
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <View style={styles.productCard}>
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [styles.tilePress, pressed && { opacity: 0.97 }]}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.title}`}
      >
        <View style={styles.thumbWrap}>
          {thumbFailed ? (
            <View style={styles.thumbFallback}>
              <Text style={styles.thumbFallbackText}>{initials || "IH"}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.thumb}
              resizeMode="cover"
              onError={() => setThumbFailed(true)}
            />
          )}
          {product.badge ? (
            <View style={styles.productBadgeOverlay}>
              <Text style={styles.productBadgeOverlayText}>{product.badge}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.productTitleText} numberOfLines={2}>
          {product.title}
        </Text>

        <Text style={styles.productMeta} numberOfLines={1}>
          {product.rating.toFixed(1)} ★ · {product.reviewCount.toLocaleString("en-IN")} reviews
        </Text>

        <Text style={styles.productHighlights} numberOfLines={1}>
          {product.highlights.slice(0, 2).join(" · ")}
        </Text>
      </Pressable>

      <View style={styles.tileBottomRow}>
        <Text style={styles.productPrice}>{formatINR(product.price)}</Text>
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.title} to cart`}
          style={({ pressed }) => [
            styles.addBtn,
            qtyInCart > 0 && styles.addBtnActive,
            pressed && { opacity: 0.93 },
          ]}
        >
          {qtyInCart > 0 ? (
            <Text style={[styles.addBtnText, styles.addBtnTextActive]}>
              Added ×{qtyInCart}
            </Text>
          ) : (
            <View style={styles.addBtnRow}>
              <Ionicons name="cart-outline" size={16} color="#ffffff" />
              <Text style={[styles.addBtnText, styles.addBtnTextNew]}>Add</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function InstaHelpShopScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [category, setCategory] = useState<ShopCategoryId>("all");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<Record<string, number>>({});
  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, n) => sum + n, 0),
    [cart],
  );

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedProduct = useMemo(
    () => SHOP_MOCK_PRODUCTS.find((p) => p.id === selectedProductId) ?? null,
    [selectedProductId],
  );
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    const byCategory =
      category === "all"
        ? SHOP_MOCK_PRODUCTS
        : SHOP_MOCK_PRODUCTS.filter((p) => p.categoryId === category);

    if (!q) return byCategory;

    return byCategory.filter((p) => {
      const hay = `${p.title} ${p.description} ${p.highlights.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [category, search]);

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  };

  const GRID_GUTTER = 12;
  const GRID_SIDE = 16;
  const tileWidth = useMemo(() => {
    const w = windowWidth - GRID_SIDE * 2 - GRID_GUTTER;
    return Math.floor(w / 2);
  }, [windowWidth]);

  return (
    <Screen className="bg-[#f4f7fc]">
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[
          styles.gridContainer,
          { paddingBottom: 120 + insets.bottom },
        ]}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
              <LinearGradient
                colors={["#5B21B6", "#7C3AED", "#8B5CF6", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {Platform.OS === "ios" ? (
                <BlurView
                  intensity={18}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
              ) : null}

              <View style={styles.headerOrb1} pointerEvents="none" />
              <View style={styles.headerOrb2} pointerEvents="none" />

              <View style={styles.headerTopRow}>
                <View style={styles.headerTitleBlock}>
                  <Text style={styles.headerTitle}>InstaHelp Shop</Text>
                  <Text style={styles.headerSubtitle}>
                    Mock catalog · add to cart works locally
                  </Text>
                </View>

                <View style={styles.cartPill} accessibilityLabel="Cart count">
                  <Ionicons name="cart-outline" size={16} color="#5B21B6" />
                  <Text style={styles.cartPillText}>{cartCount}</Text>
                </View>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.searchWrap}>
                <View style={styles.searchCard}>
                  <Ionicons name="search" size={18} color="#7C3AED" />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={getSearchPlaceholder(category)}
                    placeholderTextColor="rgba(82, 82, 82, 0.55)"
                    style={styles.searchInput}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {search.trim().length > 0 ? (
                    <Pressable
                      hitSlop={6}
                      onPress={() => setSearch("")}
                      accessibilityRole="button"
                      accessibilityLabel="Clear search"
                      style={styles.clearBtn}
                    >
                      <Ionicons name="close-circle" size={18} color="#6b7280" />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <ShopCategoryTabs
                active={category}
                onChange={(id) => {
                  setCategory(id);
                  setSearch("");
                }}
              />

              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Products</Text>
                <Text style={styles.resultsCount}>
                  {filteredProducts.length} item
                  {filteredProducts.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={[styles.body, { paddingTop: 6 }]}>
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={26} color="#7C3AED" />
              <Text style={styles.emptyTitle}>No matches</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or pick another category.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ width: tileWidth, marginBottom: GRID_GUTTER }}>
            <ProductTile
              product={item}
              qtyInCart={cart[item.id] ?? 0}
              onAdd={() => addToCart(item.id)}
              onOpen={() => {
                setHeroImgFailed(false);
                setSelectedProductId(item.id);
              }}
            />
          </View>
        )}
      />

      {/* Product details modal */}
        <Modal
          visible={selectedProduct != null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedProductId(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSelectedProductId(null)}
          />

          <View style={styles.modalCard}>
            {selectedProduct ? (
              <>
                {heroImgFailed ? (
                  <View style={styles.modalHeroFallback}>
                    <Text style={styles.modalHeroFallbackText}>
                      {initialsFromTitle(selectedProduct.title) || "IH"}
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: selectedProduct.imageUrl }}
                    style={styles.modalHero}
                    resizeMode="cover"
                    onError={() => setHeroImgFailed(true)}
                  />
                )}

                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selectedProduct.title}
                  </Text>
                  <Pressable
                    onPress={() => setSelectedProductId(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </Pressable>
                </View>

                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalPrice}>
                    {formatINR(selectedProduct.price)}
                  </Text>
                  <Text style={styles.modalMeta}>
                    {selectedProduct.rating.toFixed(1)} ★ ·{" "}
                    {selectedProduct.reviewCount.toLocaleString("en-IN")}{" "}
                    reviews
                  </Text>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalSectionTitle}>About</Text>
                  <Text style={styles.modalDescription}>
                    {selectedProduct.description}
                  </Text>

                  <Text style={styles.modalSectionTitle}>Highlights</Text>
                  <View style={styles.highlightsList}>
                    {selectedProduct.highlights.map((h, i) => (
                      <View key={`${selectedProduct.id}-${i}`} style={styles.highlightItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                        <Text style={styles.highlightText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Pressable
                    onPress={() => addToCart(selectedProduct.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Add to cart"
                    style={({ pressed }) => [
                      styles.modalPrimaryBtn,
                      pressed && { opacity: 0.94 },
                    ]}
                  >
                    <View style={styles.modalPrimaryRow}>
                      <Ionicons name="cart-outline" size={18} color="#ffffff" />
                      <Text style={styles.modalPrimaryText}>
                        Add to cart
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedProductId(null)}
                    accessibilityRole="button"
                    style={styles.modalSecondaryBtn}
                  >
                    <Text style={styles.modalSecondaryText}>Close</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </Modal>
    </Screen>
  );
}

function ShopCategoryTabs({
  active,
  onChange,
}: {
  active: ShopCategoryId;
  onChange: (id: ShopCategoryId) => void;
}) {
  return (
    <View style={styles.tabsWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {SHOP_CATEGORIES.map((cat) => {
          const on = active === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onChange(cat.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={styles.tabPressable}
            >
              {on ? (
                <LinearGradient
                  colors={["#5B21B6", "#7C3AED", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabPillActive}
                >
                  <Text style={styles.tabLabelActive}>{cat.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabPill}>
                  <Text style={styles.tabLabel}>{cat.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    overflow: "hidden",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerOrb1: {
    position: "absolute",
    right: -24,
    top: 8,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerOrb2: {
    position: "absolute",
    left: -20,
    bottom: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,213,0,0.15)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "500",
    lineHeight: 20,
  },
  cartPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  cartPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#5B21B6",
  },
  body: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  searchWrap: {
    marginBottom: 12,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.10)",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99,102,241,0.10)",
  },
  tabsWrap: {
    marginTop: 2,
    marginBottom: 14,
  },
  tabsContent: {
    paddingVertical: 4,
    paddingRight: 6,
    gap: 8,
  },
  tabPressable: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.10)",
  },
  tabPillActive: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#525252",
  },
  tabLabelActive: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.10)",
    overflow: "hidden",
  },
  tilePress: {
    padding: 10,
  },
  thumbWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "rgba(17,24,39,0.06)",
  },
  thumb: {
    width: "100%",
    height: 120,
    backgroundColor: "rgba(17,24,39,0.06)",
  },
  thumbFallback: {
    width: "100%",
    height: 120,
    backgroundColor: "rgba(124,58,237,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbFallbackText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#5B21B6",
  },
  productBadgeOverlay: {
    position: "absolute",
    left: 8,
    top: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(17,24,39,0.78)",
  },
  productBadgeOverlayText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
  },
  productTitleText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    minHeight: 38,
  },
  productMeta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  productHighlights: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  tileBottomRow: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
  addBtn: {
    borderRadius: 14,
    backgroundColor: "rgba(124,58,237,0.12)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  addBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#7C3AED",
  },
  addBtnTextNew: {
    color: "#ffffff",
  },
  addBtnTextActive: {
    color: "#ffffff",
  },
  emptyState: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.08)",
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.10)",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHero: {
    width: "100%",
    height: 170,
    backgroundColor: "rgba(17,24,39,0.06)",
  },
  modalHeroFallback: {
    width: "100%",
    height: 170,
    backgroundColor: "rgba(124,58,237,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeroFallbackText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#5B21B6",
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  modalCloseBtn: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107,114,128,0.10)",
  },
  modalInfoRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  modalMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textAlign: "right",
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  modalSectionTitle: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  modalDescription: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
    lineHeight: 20,
  },
  highlightsList: {
    marginTop: 10,
    gap: 10,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.08)",
    backgroundColor: "rgba(124,58,237,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    flex: 1,
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,74,173,0.10)",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  modalPrimaryBtn: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalPrimaryText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
  modalSecondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.18)",
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  modalSecondaryText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
});

