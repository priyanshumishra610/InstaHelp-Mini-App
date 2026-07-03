import { DealCard } from "@/features/deals/components/DealCard";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import {
  formatINR,
  initialsFromTitle,
  toDisplayText,
} from "@/components/shop/shopFormatters";
import {
  SHOP_GREEN,
  SHOP_GREEN_BORDER,
  SHOP_GREEN_LIGHT,
  SHOP_ORANGE,
  SHOP_ORANGE_BG,
  SHOP_TEXT,
  SHOP_TEXT_LIGHT,
  SHOP_TEXT_MUTED,
} from "@/constants/shopTheme";
import { getSimilarDeals } from "@/features/deals/services/dealsService";
import type { Deal } from "@/features/deals/types/dealTypes";
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
  deal: Deal;
  allDeals?: Deal[];
  onClose: () => void;
  onShopNow: () => void;
  onOpenDeal: (id: string) => void;
  onGridShopNow: (deal: Deal) => void;
};

export function DealDetailScreen({
  deal,
  allDeals,
  onClose,
  onShopNow,
  onOpenDeal,
  onGridShopNow,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const galleryImages = useMemo(() => {
    if (deal.imageUrls.length > 0) return deal.imageUrls;
    return deal.imageUrl ? [deal.imageUrl] : [];
  }, [deal.imageUrl, deal.imageUrls]);

  const title = toDisplayText(deal.title);
  const description = toDisplayText(deal.description);
  const brand = toDisplayText(deal.brand);
  const merchant = toDisplayText(deal.merchant);
  const badge = toDisplayText(deal.badge);
  const cashback = toDisplayText(deal.cashbackLabel);
  const initials = initialsFromTitle(title);
  const discount =
    deal.discountPercent != null && deal.discountPercent > 0
      ? `${deal.discountPercent}% OFF`
      : null;

  const similarDeals = useMemo(
    () => getSimilarDeals(deal, allDeals),
    [deal, allDeals],
  );

  const similarTileWidth = useMemo(() => {
    const w = windowWidth - 24 - 8;
    return Math.floor(w / 2);
  }, [windowWidth]);

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
              <Pressable onPress={onClose} style={styles.topIconBtn}>
                <Ionicons name="chevron-down" size={22} color={SHOP_TEXT} />
              </Pressable>
            </View>

            {galleryImages.length > 1 ? (
              <View style={styles.heroDots}>
                {galleryImages.map((_, i) => (
                  <Pressable
                    key={`dot-${i}`}
                    onPress={() => setImageIndex(i)}
                    style={[styles.heroDot, i === imageIndex && styles.heroDotActive]}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.body}>
            <View style={styles.tagRow}>
              {badge ? (
                <View style={styles.specialTag}>
                  <Text style={styles.specialTagText}>{badge}</Text>
                </View>
              ) : null}
              {cashback ? (
                <View style={styles.cashbackTag}>
                  <Text style={styles.cashbackTagText}>{cashback}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.brand}>{brand}</Text>

            {deal.currentPrice != null ? (
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatINR(deal.currentPrice)}</Text>
                {deal.originalPrice != null && deal.originalPrice > deal.currentPrice ? (
                  <Text style={styles.mrp}>{formatINR(deal.originalPrice)}</Text>
                ) : null}
              </View>
            ) : null}

            {discount ? <Text style={styles.discount}>{discount}</Text> : null}

            <Pressable style={styles.infoCard}>
              <View style={styles.merchantAvatar}>
                <Text style={styles.merchantAvatarText}>
                  {merchant.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.infoCardBody}>
                <Text style={styles.infoCardTitle}>{merchant}</Text>
                <Text style={styles.infoCardSub}>Official partner merchant</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={SHOP_TEXT_LIGHT} />
            </Pressable>

            {description ? (
              <>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{description}</Text>
              </>
            ) : null}

            {similarDeals.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                  Similar deals
                </Text>
                <View style={styles.similarGrid}>
                  {similarDeals.map((item) => (
                    <DealCard
                      key={item.id}
                      deal={item}
                      width={similarTileWidth}
                      onOpen={() => onOpenDeal(item.id)}
                      onGetDeal={() => onGridShopNow(item)}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 10 + insets.bottom }]}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerMerchant}>{merchant}</Text>
            {deal.currentPrice != null ? (
              <Text style={styles.footerPrice}>{formatINR(deal.currentPrice)}</Text>
            ) : (
              <Text style={styles.footerPrice}>View Offer</Text>
            )}
            {discount ? <Text style={styles.footerDiscount}>{discount}</Text> : null}
          </View>
          <Pressable onPress={onShopNow} style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Shop Now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#ffffff" },
  heroWrap: { height: 300, backgroundColor: "#f7f7f7", position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroFallbackText: { fontSize: 32, fontWeight: "900", color: SHOP_GREEN },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 8,
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
  heroDotActive: { width: 16, backgroundColor: SHOP_TEXT },
  body: { paddingHorizontal: 16, paddingTop: 4 },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  specialTag: {
    borderRadius: 4,
    backgroundColor: SHOP_ORANGE_BG,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specialTagText: { fontSize: 11, fontWeight: "800", color: SHOP_ORANGE },
  cashbackTag: {
    borderRadius: 4,
    backgroundColor: SHOP_GREEN_LIGHT,
    borderWidth: 1,
    borderColor: SHOP_GREEN_BORDER,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cashbackTagText: { fontSize: 11, fontWeight: "800", color: SHOP_GREEN },
  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: SHOP_TEXT,
    lineHeight: 24,
  },
  brand: { marginTop: 4, fontSize: 13, fontWeight: "600", color: SHOP_TEXT_MUTED },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 10,
  },
  price: { fontSize: 20, fontWeight: "900", color: SHOP_TEXT },
  mrp: {
    fontSize: 13,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
    textDecorationLine: "line-through",
  },
  discount: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#256fef",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  merchantAvatar: {
    height: 40,
    width: 40,
    borderRadius: 10,
    backgroundColor: SHOP_GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  merchantAvatarText: { fontSize: 12, fontWeight: "900", color: SHOP_GREEN },
  infoCardBody: { flex: 1 },
  infoCardTitle: { fontSize: 14, fontWeight: "800", color: SHOP_TEXT },
  infoCardSub: { marginTop: 2, fontSize: 12, fontWeight: "600", color: SHOP_TEXT_LIGHT },
  sectionTitle: { marginTop: 18, fontSize: 15, fontWeight: "800", color: SHOP_TEXT },
  description: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: SHOP_TEXT_MUTED,
    lineHeight: 22,
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
  },
  footerInfo: { flex: 1 },
  footerMerchant: { fontSize: 11, fontWeight: "600", color: SHOP_TEXT_LIGHT },
  footerPrice: { marginTop: 2, fontSize: 18, fontWeight: "900", color: SHOP_TEXT },
  footerDiscount: { fontSize: 11, fontWeight: "800", color: "#256fef", marginTop: 2 },
  footerBtn: {
    minWidth: 140,
    borderRadius: 10,
    backgroundColor: SHOP_GREEN,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  footerBtnText: { fontSize: 15, fontWeight: "900", color: "#ffffff" },
});
