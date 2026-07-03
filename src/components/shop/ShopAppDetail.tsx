import { APP_CATEGORIES } from "@/apps";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import {
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
import type { ShopApp } from "@/types/shopApp";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
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
  app: ShopApp;
  similarApps: ShopApp[];
  onClose: () => void;
  onOpenApp: () => void;
  onOpenAppDetail: (id: string) => void;
  onGridOpenApp: (app: ShopApp) => void;
};

function appCategoryLabel(appCategoryId: ShopApp["appCategoryId"]) {
  return APP_CATEGORIES[appCategoryId]?.label ?? "App";
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

function AttrCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.attrCard}>
      <Text style={styles.attrLabel}>{label}</Text>
      <Text style={styles.attrValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function ShopAppDetail({
  app,
  similarApps,
  onClose,
  onOpenApp,
  onOpenAppDetail,
  onGridOpenApp,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const galleryImages = useMemo(() => {
    if (app.bannerUrls.length > 0) return app.bannerUrls;
    return app.logoUrl ? [app.logoUrl] : [];
  }, [app.bannerUrls, app.logoUrl]);

  const title = toDisplayText(app.name);
  const description = toDisplayText(app.description);
  const badge = toDisplayText(app.badge);
  const initials = initialsFromTitle(title);
  const catLabel = appCategoryLabel(app.appCategoryId);

  const similarTileWidth = useMemo(() => {
    const w = windowWidth - 24 - 8;
    return Math.floor(w / 2);
  }, [windowWidth]);

  const attrCards = useMemo(() => {
    const cards: { label: string; value: string }[] = [
      { label: "Category", value: catLabel },
    ];
    if (app.reviewCount > 0) {
      cards.push({
        label: "Rating",
        value: `${app.rating.toFixed(1)} ★`,
      });
    }
    if (badge) {
      cards.push({ label: "Popularity", value: badge });
    } else if (app.isTrending) {
      cards.push({ label: "Popularity", value: "Trending" });
    } else if (app.isNew) {
      cards.push({ label: "Popularity", value: "New" });
    }
    return cards.slice(0, 3);
  }, [app, badge, catLabel]);

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
              ) : app.isTrending ? (
                <View style={styles.specialTag}>
                  <Text style={styles.specialTagText}>Trending</Text>
                </View>
              ) : app.isNew ? (
                <View style={styles.specialTag}>
                  <Text style={styles.specialTagText}>New</Text>
                </View>
              ) : null}
              <View style={styles.deliveryTag}>
                <Ionicons name="apps-outline" size={12} color={SHOP_TEXT_MUTED} />
                <Text style={styles.deliveryTagText}>{catLabel}</Text>
              </View>
            </View>

            {app.reviewCount > 0 ? (
              <StarRow rating={app.rating} reviewCount={app.reviewCount} />
            ) : null}

            <Text style={styles.title}>{title}</Text>

            <Pressable style={styles.infoCard} accessibilityRole="button">
              <View style={styles.brandAvatar}>
                <Text style={styles.brandAvatarText}>
                  {catLabel.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.infoCardBody}>
                <Text style={styles.infoCardTitle}>{catLabel}</Text>
                <Text style={styles.infoCardSub}>Explore more apps</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={SHOP_TEXT_LIGHT} />
            </Pressable>

            <Pressable
              onPress={onOpenApp}
              style={styles.infoCard}
              accessibilityRole="button"
            >
              <View style={styles.policyIcon}>
                <Ionicons name="globe-outline" size={18} color={SHOP_GREEN} />
              </View>
              <View style={styles.infoCardBody}>
                <Text style={styles.infoCardTitle}>Official website</Text>
                <Text style={styles.infoCardSub} numberOfLines={1}>
                  {app.websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color={SHOP_TEXT_LIGHT} />
            </Pressable>

            {description ? (
              <View nativeID="about-section">
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
            ) : null}

            {app.features.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Features</Text>
                {app.features.map((feature, i) => {
                  const text = toDisplayText(feature);
                  if (!text) return null;
                  return (
                    <View key={`${app.id}-feature-${i}`} style={styles.highlightRow}>
                      <Ionicons name="checkmark-circle" size={16} color={SHOP_GREEN} />
                      <Text style={styles.highlightText}>{text}</Text>
                    </View>
                  );
                })}
              </>
            ) : null}

            {similarApps.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                  Similar apps
                </Text>
                <View style={styles.similarGrid}>
                  {similarApps.map((item) => (
                    <ShopProductCard
                      key={item.id}
                      variant="app"
                      app={item}
                      width={similarTileWidth}
                      onOpen={() => onOpenAppDetail(item.id)}
                      onOpenApp={() => onGridOpenApp(item)}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 10 + insets.bottom }]}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerUnit}>{catLabel}</Text>
            <Text style={styles.footerAppName}>{title}</Text>
            {app.reviewCount > 0 ? (
              <Text style={styles.footerTax}>
                {app.rating.toFixed(1)} ★ · {formatReviewCount(app.reviewCount)} reviews
              </Text>
            ) : (
              <Text style={styles.footerTax}>Free to download</Text>
            )}
          </View>

          <Pressable
            onPress={onOpenApp}
            style={styles.footerBtn}
            accessibilityRole="button"
            accessibilityLabel="Open app"
          >
            <Text style={styles.footerBtnText}>Open App</Text>
          </Pressable>
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
  sectionTitle: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: "800",
    color: SHOP_TEXT,
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
  footerAppName: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "900",
    color: SHOP_TEXT,
  },
  footerTax: {
    fontSize: 10,
    fontWeight: "500",
    color: SHOP_TEXT_LIGHT,
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
});
