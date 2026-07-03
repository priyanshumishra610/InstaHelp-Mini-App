import { formatINR, initialsFromTitle, toDisplayText } from "@/components/shop/shopFormatters";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import {
  SHOP_BLUE,
  SHOP_GREEN,
  SHOP_GREEN_BORDER,
  SHOP_ORANGE,
  SHOP_ORANGE_BG,
  SHOP_TEXT,
  SHOP_TEXT_LIGHT,
  SHOP_TEXT_MUTED,
  SHOP_YELLOW_BG,
  SHOP_YELLOW_TEXT,
} from "@/constants/shopTheme";
import type { Deal } from "@/features/deals/types/dealTypes";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  deal: Deal;
  width: number;
  onOpen: () => void;
  onGetDeal: () => void;
  compact?: boolean;
};

export function DealCard({ deal, width, onOpen, onGetDeal, compact }: Props) {
  const title = toDisplayText(deal.title);
  const brand = toDisplayText(deal.brand);
  const badge = toDisplayText(deal.badge);
  const cashback = toDisplayText(deal.cashbackLabel);
  const initials = initialsFromTitle(title);
  const discount =
    deal.discountPercent != null && deal.discountPercent > 0
      ? `${deal.discountPercent}% OFF`
      : null;

  return (
    <View style={[styles.card, { width }, compact && styles.cardCompact]}>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`View ${title}`}>
        <View style={styles.imageBox}>
          <ShopProductImage
            uri={deal.imageUrl}
            fallbackLabel={initials || "IH"}
            style={styles.image}
            contentFit="cover"
          />
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
          {cashback ? (
            <View style={styles.cashbackBadge}>
              <Text style={styles.cashbackText}>{cashback}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.actionRow}>
        <View style={styles.merchantChip}>
          <Text style={styles.merchantText} numberOfLines={1}>
            {brand || deal.merchant}
          </Text>
        </View>
        <Pressable
          onPress={onGetDeal}
          style={styles.ctaBtn}
          accessibilityRole="button"
          accessibilityLabel={`Get deal for ${title}`}
        >
          <Text style={styles.ctaText}>Get Deal</Text>
        </Pressable>
      </View>

      <Pressable onPress={onOpen}>
        {deal.currentPrice != null ? (
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatINR(deal.currentPrice)}</Text>
            {deal.originalPrice != null && deal.originalPrice > deal.currentPrice ? (
              <Text style={styles.mrp}>{formatINR(deal.originalPrice)}</Text>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.title} numberOfLines={compact ? 2 : 3}>
          {title}
        </Text>

        {discount ? (
          <View style={styles.discountTag}>
            <Text style={styles.discountText}>{discount}</Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <Ionicons name="link-outline" size={11} color={SHOP_TEXT_LIGHT} />
          <Text style={styles.metaText}>Partner Offer</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  cardCompact: {
    marginBottom: 8,
  },
  imageBox: {
    height: 130,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: SHOP_ORANGE_BG,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: SHOP_ORANGE,
  },
  cashbackBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    borderRadius: 4,
    backgroundColor: SHOP_YELLOW_BG,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cashbackText: {
    fontSize: 8,
    fontWeight: "800",
    color: SHOP_YELLOW_TEXT,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  merchantChip: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  merchantText: {
    fontSize: 10,
    fontWeight: "700",
    color: SHOP_TEXT_MUTED,
  },
  ctaBtn: {
    minWidth: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SHOP_GREEN_BORDER,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 11,
    fontWeight: "900",
    color: SHOP_GREEN,
    letterSpacing: 0.3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "900",
    color: SHOP_TEXT,
  },
  mrp: {
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
    textDecorationLine: "line-through",
  },
  title: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: SHOP_TEXT,
    lineHeight: 16,
  },
  discountTag: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 4,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "800",
    color: SHOP_BLUE,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
  },
});
