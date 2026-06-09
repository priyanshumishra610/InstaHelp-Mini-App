import { ShopProductCard } from "@/components/shop/ShopProductCard";
import {
  discountLabel,
  formatINR,
  formatReviewCount,
  initialsFromTitle,
  toDisplayText,
} from "@/components/shop/shopFormatters";
import {
  SHOP_GREEN,
  SHOP_GREEN_BORDER,
  SHOP_GREEN_DARK,
  SHOP_GREEN_LIGHT,
  SHOP_ORANGE,
  SHOP_ORANGE_BG,
  SHOP_TEXT,
  SHOP_TEXT_LIGHT,
  SHOP_TEXT_MUTED,
} from "@/constants/shopTheme";
import type { ShopCategoryId } from "@/constants/shop";
import { SHOP_CATEGORIES } from "@/constants/shop";
import type {
  ShopCatalogProduct,
  ShopPlatformOffer,
} from "@/types/shopCatalog";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  product: ShopCatalogProduct;
  similarProducts: ShopCatalogProduct[];
  sortedPlatforms: ShopPlatformOffer[];
  qtyInCart: number;
  cart: Record<string, number>;
  onClose: () => void;
  onAddToCart: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onOpenProduct: (id: string) => void;
  onAffiliateOpen: (platform: ShopPlatformOffer) => void;
  onGridAdd: (id: string) => void;
  onGridIncrement: (id: string) => void;
  onGridDecrement: (id: string) => void;
};

function categoryLabel(categoryId: ShopCategoryId) {
  return SHOP_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "Shop";
}

function StarRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={
            i < full
              ? "star"
              : i === full && half
                ? "star-half"
                : "star-outline"
          }
          size={14}
          color="#f59e0b"
        />
      ))}
      <Text style={styles.starCount}>{formatReviewCount(reviewCount)}</Text>
    </View>
  );
}

function AttrCard({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.attrCard, onPress && styles.attrCardLink]}>
      <Text style={styles.attrLabel}>{label}</Text>
      <Text style={styles.attrValue} numberOfLines={2}>
        {value}
      </Text>
      {onPress ? (
        <Ionicons
          name="chevron-forward"
          size={14}
          color={SHOP_GREEN}
          style={styles.attrChevron}
        />
      ) : null}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.attrCardPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function ShopProductDetail({
  product,
  similarProducts,
  sortedPlatforms,
  qtyInCart,
  cart,
  onClose,
  onAddToCart,
  onIncrement,
  onDecrement,
  onOpenProduct,
  onAffiliateOpen,
  onGridAdd,
  onGridIncrement,
  onGridDecrement,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedPlatformIdx, setSelectedPlatformIdx] = useState(0);

  const galleryImages = useMemo(() => {
    if (product.imageUrls.length > 0) return product.imageUrls;
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product.imageUrl, product.imageUrls]);

  const selectedPlatform = sortedPlatforms[selectedPlatformIdx] ?? null;
  const displayPrice = selectedPlatform?.price ?? product.bestPrice;
  const displayMrp = product.maxPrice;
  const title = toDisplayText(product.title);
  const description = toDisplayText(product.description);
  const stock = toDisplayText(product.stock);
  const badge = toDisplayText(product.badge);
  const initials = initialsFromTitle(title);
  const catLabel = categoryLabel(product.categoryId);
  const discount = discountLabel(product);

  const similarTileWidth = useMemo(() => {
    const w = windowWidth - 24 - 8;
    return Math.floor(w / 2);
  }, [windowWidth]);

  const attrCards = useMemo(() => {
    const cards: { label: string; value: string; link?: boolean }[] = [];
    const brandText = toDisplayText(product.brand);
    const h0 = toDisplayText(product.highlights[0]);
    const h1 = toDisplayText(product.highlights[1]);
    if (brandText) {
      cards.push({ label: "Brand", value: brandText });
    } else if (h0) {
      cards.push({ label: "Feature", value: h0 });
    }
    if (h1) {
      cards.push({ label: "Highlight", value: h1 });
    } else if (product.reviewCount > 0) {
      cards.push({
        label: "Rating",
        value: `${product.rating.toFixed(1)} ★`,
      });
    }
    if (stock) {
      cards.push({ label: "Availability", value: stock });
    }
    return cards.slice(0, 3);
  }, [product]);

  const scrollToAbout = () => {
    scrollRef.current?.scrollTo({ y: 520, animated: true });
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={styles.root}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        >
          <View style={styles.heroWrap}>
            {galleryImages.length > 0 ? (
              <ShopProductImage
                uri={galleryImages[imageIndex] ?? ""}
                fallbackLabel={initials || "IH"}
                style={styles.heroImage}
                contentFit="contain"
              />
            ) : (
              <View style={styles.heroFallback}>
                <Text style={styles.heroFallbackText}>{initials || "IH"}</Text>
              </View>
            )}

            <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
              <Pressable
                onPress={onClose}
                style={styles.topIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="chevron-down" size={22} color={SHOP_TEXT} />
              </Pressable>
              <View style={styles.topBarRight}>
                <Pressable style={styles.topIconBtn} accessibilityRole="button">
                  <Ionicons name="heart-outline" size={20} color={SHOP_TEXT} />
                </Pressable>
                <Pressable style={styles.topIconBtn} accessibilityRole="button">
                  <Ionicons name="search-outline" size={20} color={SHOP_TEXT} />
                </Pressable>
                <Pressable style={styles.topIconBtn} accessibilityRole="button">
                  <Ionicons name="share-social-outline" size={20} color={SHOP_TEXT} />
                </Pressable>
              </View>
            </View>

            {galleryImages.length > 1 ? (
              <View style={styles.heroDots}>
                {galleryImages.map((_, i) => (
                  <Pressable
                    key={`gallery-dot-${i}`}
                    onPress={() => setImageIndex(i)}
                    style={[
                      styles.heroDot,
                      i === imageIndex && styles.heroDotActive,
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>

          {attrCards.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attrRow}
            >
              {attrCards.map((card) => (
                <AttrCard
                  key={`${card.label}-${card.value}`}
                  label={card.label}
                  value={card.value}
                />
              ))}
              <Pressable onPress={scrollToAbout} style={styles.viewDetailsCard}>
                <Text style={styles.viewDetailsText}>View details</Text>
                <Ionicons name="chevron-forward" size={14} color={SHOP_GREEN} />
              </Pressable>
            </ScrollView>
          ) : null}

          <View style={styles.body}>
            <View style={styles.tagRow}>
              {badge ? (
                <View style={styles.specialTag}>
                  <Text style={styles.specialTagText}>{badge}</Text>
                </View>
              ) : null}
              <View style={styles.deliveryTag}>
                <Ionicons name="time-outline" size={12} color={SHOP_TEXT_MUTED} />
                <Text style={styles.deliveryTagText}>Compare prices</Text>
              </View>
            </View>

            {product.reviewCount > 0 ? (
              <StarRow rating={product.rating} reviewCount={product.reviewCount} />
            ) : null}

            <Text style={styles.title}>{title}</Text>

            {stock ? (
              <View style={styles.stockRow}>
                <Ionicons name="battery-dead-outline" size={14} color={SHOP_ORANGE} />
                <Text style={styles.stockText}>{stock}</Text>
              </View>
            ) : null}

            {sortedPlatforms.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Select Store</Text>
                <View style={styles.unitRow}>
                  {sortedPlatforms.map((platform, index) => {
                    const selected = index === selectedPlatformIdx;
                    const unavailable = platform.price == null;
                    return (
                      <Pressable
                        key={platform.platform}
                        onPress={() => setSelectedPlatformIdx(index)}
                        style={[
                          styles.unitCard,
                          selected && styles.unitCardSelected,
                          unavailable && styles.unitCardDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            styles.unitLabel,
                            selected && styles.unitLabelSelected,
                          ]}
                        >
                          {platform.platformLabel}
                        </Text>
                        {unavailable ? (
                          <Text style={styles.unitOos}>Out of stock</Text>
                        ) : (
                          <>
                            <Text
                              style={[
                                styles.unitPrice,
                                selected && styles.unitPriceSelected,
                              ]}
                            >
                              {formatINR(platform.price!)}
                            </Text>
                            {product.maxPrice != null &&
                            platform.price! < product.maxPrice ? (
                              <Text style={styles.unitMrp}>
                                MRP {formatINR(product.maxPrice)}
                              </Text>
                            ) : null}
                          </>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            <Pressable style={styles.infoCard} accessibilityRole="button">
              <View style={styles.brandAvatar}>
                <Text style={styles.brandAvatarText}>
                  {catLabel.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.infoCardBody}>
                <Text style={styles.infoCardTitle}>{catLabel}</Text>
                <Text style={styles.infoCardSub}>Explore all products</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={SHOP_TEXT_LIGHT} />
            </Pressable>

            <Pressable style={styles.infoCard} accessibilityRole="button">
              <View style={styles.policyIcon}>
                <Ionicons name="swap-horizontal" size={18} color={SHOP_GREEN} />
              </View>
              <View style={styles.infoCardBody}>
                <Text style={styles.infoCardTitle}>
                  Best price across stores
                </Text>
                <Text style={styles.infoCardSub}>
                  Tap a store to open affiliate link
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={SHOP_TEXT_LIGHT} />
            </Pressable>

            {description ? (
              <View nativeID="about-section">
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
            ) : null}

            {product.highlights.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Highlights</Text>
                {product.highlights.map((h, i) => {
                  const text = toDisplayText(h);
                  if (!text) return null;
                  return (
                    <View key={`${product.id}-hl-${i}`} style={styles.highlightRow}>
                      <Ionicons name="checkmark-circle" size={16} color={SHOP_GREEN} />
                      <Text style={styles.highlightText}>{text}</Text>
                    </View>
                  );
                })}
              </>
            ) : null}

            {similarProducts.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                  Similar products
                </Text>
                <View style={styles.similarGrid}>
                  {similarProducts.map((item) => (
                    <ShopProductCard
                      key={item.id}
                      product={item}
                      width={similarTileWidth}
                      qtyInCart={cart[item.id] ?? 0}
                      onOpen={() => onOpenProduct(item.id)}
                      onAdd={() => onGridAdd(item.id)}
                      onIncrement={() => onGridIncrement(item.id)}
                      onDecrement={() => onGridDecrement(item.id)}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: 10 + insets.bottom }]}
        >
          <View style={styles.footerPrice}>
            <Text style={styles.footerUnit}>
              {selectedPlatform?.platformLabel ?? (stock || "1 pc")}
            </Text>
            <View style={styles.footerPriceRow}>
              <Text style={styles.footerPriceValue}>
                {displayPrice != null ? formatINR(displayPrice) : "—"}
              </Text>
              {displayMrp != null &&
              displayPrice != null &&
              displayMrp > displayPrice ? (
                <Text style={styles.footerMrp}>MRP {formatINR(displayMrp)}</Text>
              ) : null}
            </View>
            <Text style={styles.footerTax}>Inclusive of all taxes</Text>
            {discount ? (
              <Text style={styles.footerDiscount}>{discount}</Text>
            ) : null}
          </View>

          {qtyInCart > 0 ? (
            <View style={styles.footerQtyWrap}>
              <Pressable
                onPress={onDecrement}
                style={styles.footerQtyBtn}
                accessibilityRole="button"
              >
                <Ionicons name="remove" size={20} color="#ffffff" />
              </Pressable>
              <Text style={styles.footerQtyText}>{qtyInCart}</Text>
              <Pressable
                onPress={onIncrement}
                style={styles.footerQtyBtn}
                accessibilityRole="button"
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </Pressable>
            </View>
          ) : selectedPlatform ? (
            <Pressable
              onPress={() => {
                onAddToCart();
                onAffiliateOpen(selectedPlatform);
              }}
              style={styles.footerBtn}
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
            >
              <Text style={styles.footerBtnText}>Add to cart</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onAddToCart}
              style={styles.footerBtn}
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
            >
              <Text style={styles.footerBtnText}>Add to cart</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  heroWrap: {
    height: 300,
    backgroundColor: "#f7f7f7",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroFallbackText: {
    fontSize: 32,
    fontWeight: "900",
    color: SHOP_GREEN,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  topBarRight: {
    flexDirection: "row",
    gap: 4,
  },
  topIconBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroDots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  heroDotActive: {
    width: 16,
    backgroundColor: SHOP_TEXT,
  },
  attrRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  attrCardPress: {
    width: 108,
  },
  attrCard: {
    width: 108,
    minHeight: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: "center",
  },
  attrCardLink: {
    borderColor: SHOP_GREEN_BORDER,
    backgroundColor: SHOP_GREEN_LIGHT,
    alignItems: "center",
  },
  attrLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
  },
  attrValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  attrChevron: {
    marginTop: 4,
  },
  viewDetailsCard: {
    width: 108,
    minHeight: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SHOP_GREEN_BORDER,
    backgroundColor: SHOP_GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "800",
    color: SHOP_GREEN,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  specialTag: {
    borderRadius: 4,
    backgroundColor: SHOP_ORANGE_BG,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specialTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: SHOP_ORANGE,
  },
  deliveryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT_MUTED,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 10,
  },
  starCount: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: SHOP_TEXT,
    lineHeight: 24,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "700",
    color: SHOP_ORANGE,
  },
  sectionTitle: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  unitRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  unitCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 88,
  },
  unitCardSelected: {
    borderColor: SHOP_GREEN,
    borderWidth: 2,
    backgroundColor: SHOP_GREEN_LIGHT,
  },
  unitCardDisabled: {
    opacity: 0.55,
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  unitLabelSelected: {
    color: SHOP_GREEN_DARK,
  },
  unitPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "900",
    color: SHOP_TEXT,
  },
  unitPriceSelected: {
    color: SHOP_GREEN_DARK,
  },
  unitMrp: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
    textDecorationLine: "line-through",
  },
  unitOos: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: SHOP_TEXT_LIGHT,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  brandAvatar: {
    height: 40,
    width: 40,
    borderRadius: 10,
    backgroundColor: SHOP_GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  brandAvatarText: {
    fontSize: 12,
    fontWeight: "900",
    color: SHOP_GREEN,
  },
  policyIcon: {
    height: 40,
    width: 40,
    borderRadius: 10,
    backgroundColor: SHOP_GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardBody: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  infoCardSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: SHOP_TEXT_MUTED,
    lineHeight: 22,
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: SHOP_TEXT,
  },
  similarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  footerPrice: {
    flex: 1,
  },
  footerUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
  },
  footerPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 2,
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: "900",
    color: SHOP_TEXT,
  },
  footerMrp: {
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
    textDecorationLine: "line-through",
  },
  footerTax: {
    fontSize: 10,
    fontWeight: "500",
    color: SHOP_TEXT_LIGHT,
    marginTop: 2,
  },
  footerDiscount: {
    fontSize: 11,
    fontWeight: "800",
    color: "#256fef",
    marginTop: 2,
  },
  footerBtn: {
    minWidth: 140,
    borderRadius: 10,
    backgroundColor: SHOP_GREEN,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
  footerQtyWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: SHOP_GREEN,
    overflow: "hidden",
  },
  footerQtyBtn: {
    width: 44,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  footerQtyText: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
});
