import {
  SHOP_BLUE,
  SHOP_GREEN,
  SHOP_GREEN_BORDER,
  SHOP_GREEN_LIGHT,
  SHOP_ORANGE,
  SHOP_ORANGE_BG,
  SHOP_TEXT,
  SHOP_TEXT_LIGHT,
  SHOP_TEXT_MUTED,
  SHOP_YELLOW_BG,
  SHOP_YELLOW_TEXT,
} from "@/constants/shopTheme";
import type { ShopCatalogProduct } from "@/types/shopCatalog";
import type { ShopApp } from "@/types/shopApp";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ShopProductImage } from "./ShopProductImage";
import {
  discountLabel,
  formatINR,
  formatReviewCount,
  initialsFromTitle,
  platformOptionCount,
  toDisplayText,
} from "./shopFormatters";

type ProductCardProps = {
  variant?: "product";
  product: ShopCatalogProduct;
  width: number;
  qtyInCart: number;
  onOpen: () => void;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

type AppCardProps = {
  variant: "app";
  app: ShopApp;
  width: number;
  onOpen: () => void;
  onOpenApp: () => void;
};

type Props = ProductCardProps | AppCardProps;

function StarRow({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < full ? "star" : "star-outline"}
          size={11}
          color="#f59e0b"
        />
      ))}
    </View>
  );
}

export function ShopProductCard(props: Props) {
  if (props.variant === "app") {
    return <AppCard {...props} />;
  }
  return <ProductCard {...props} />;
}

function ProductCard({
  product,
  width,
  qtyInCart,
  onOpen,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const initials = initialsFromTitle(product.title);
  const options = platformOptionCount(product);
  const discount = discountLabel(product);
  const badge = toDisplayText(product.badge);
  const stock = toDisplayText(product.stock);
  const title = toDisplayText(product.title);
  const highlight = toDisplayText(product.highlights[0]);

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.title}`}
      >
        <View style={styles.imageBox}>
          <ShopProductImage
            uri={product.imageUrl}
            fallbackLabel={initials || "IH"}
            style={styles.image}
            contentFit="contain"
          />

          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}

          <Pressable
            hitSlop={8}
            style={styles.heartBtn}
            accessibilityRole="button"
            accessibilityLabel="Add to wishlist"
          >
            <Ionicons name="heart-outline" size={16} color="#9ca3af" />
          </Pressable>

          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </Pressable>

      <View style={styles.actionRow}>
        <View style={styles.weightChip}>
          <Text style={styles.weightText}>
            {stock.trim() || "1 pc"}
          </Text>
        </View>

        {qtyInCart > 0 ? (
          <View style={styles.qtyStepper}>
            <Pressable
              onPress={onDecrement}
              style={styles.qtyBtn}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
            >
              <Ionicons name="remove" size={16} color={SHOP_GREEN} />
            </Pressable>
            <Text style={styles.qtyText}>{qtyInCart}</Text>
            <Pressable
              onPress={onIncrement}
              style={styles.qtyBtn}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={16} color={SHOP_GREEN} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onAdd}
            style={styles.addBtn}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.title}`}
          >
            <Text style={styles.addBtnText}>ADD</Text>
            {options > 1 ? (
              <Text style={styles.addOptionsText}>{options} options</Text>
            ) : null}
          </Pressable>
        )}
      </View>

      <Pressable onPress={onOpen}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {product.bestPrice != null
              ? formatINR(product.bestPrice)
              : "—"}
          </Text>
          {product.maxPrice != null &&
          product.bestPrice != null &&
          product.maxPrice > product.bestPrice ? (
            <Text style={styles.mrp}>MRP {formatINR(product.maxPrice)}</Text>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>

        {highlight ? (
          <View style={styles.featureTag}>
            <Text style={styles.featureTagText}>{highlight}</Text>
          </View>
        ) : null}

        {product.reviewCount > 0 ? (
          <View style={styles.ratingRow}>
            <StarRow rating={product.rating} />
            <Text style={styles.reviewCount}>
              {formatReviewCount(product.reviewCount)}
            </Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={SHOP_TEXT_LIGHT} />
          <Text style={styles.metaText}>Compare prices</Text>
        </View>

        {stock.toLowerCase().includes("left") ? (
          <View style={styles.stockRow}>
            <Ionicons name="bag-outline" size={12} color={SHOP_ORANGE} />
            <Text style={styles.stockText}>{stock}</Text>
          </View>
        ) : null}

        {discount ? <Text style={styles.discount}>{discount}</Text> : null}
      </Pressable>
    </View>
  );
}

function AppCard({ app, width, onOpen, onOpenApp }: AppCardProps) {
  const initials = initialsFromTitle(app.name);
  const badge = toDisplayText(app.badge);
  const title = toDisplayText(app.name);
  const highlight = toDisplayText(app.features[0]);

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`View ${app.name}`}
      >
        <View style={styles.imageBox}>
          <ShopProductImage
            uri={app.logoUrl}
            fallbackLabel={initials || "IH"}
            style={styles.image}
            contentFit="contain"
          />

          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}

          <Pressable
            hitSlop={8}
            style={styles.heartBtn}
            accessibilityRole="button"
            accessibilityLabel="Add to wishlist"
          >
            <Ionicons name="heart-outline" size={16} color="#9ca3af" />
          </Pressable>

          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </Pressable>

      <View style={styles.actionRow}>
        <View style={styles.weightChip}>
          <Text style={styles.weightText}>App</Text>
        </View>

        <Pressable
          onPress={onOpenApp}
          style={styles.addBtn}
          accessibilityRole="button"
          accessibilityLabel={`Open ${app.name}`}
        >
          <Text style={styles.addBtnText}>OPEN</Text>
        </Pressable>
      </View>

      <Pressable onPress={onOpen}>
        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>

        {highlight ? (
          <View style={styles.featureTag}>
            <Text style={styles.featureTagText}>{highlight}</Text>
          </View>
        ) : null}

        {app.reviewCount > 0 ? (
          <View style={styles.ratingRow}>
            <StarRow rating={app.rating} />
            <Text style={styles.reviewCount}>
              {formatReviewCount(app.reviewCount)}
            </Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <Ionicons name="open-outline" size={12} color={SHOP_TEXT_LIGHT} />
          <Text style={styles.metaText}>View Details</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
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
    fontSize: 9,
    fontWeight: "800",
    color: SHOP_ORANGE,
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dotActive: {
    width: 12,
    backgroundColor: SHOP_TEXT,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  weightChip: {
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  weightText: {
    fontSize: 11,
    fontWeight: "700",
    color: SHOP_TEXT_MUTED,
  },
  addBtn: {
    minWidth: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SHOP_GREEN_BORDER,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: SHOP_GREEN,
    letterSpacing: 0.3,
  },
  addOptionsText: {
    fontSize: 9,
    fontWeight: "700",
    color: SHOP_GREEN,
    marginTop: 1,
  },
  qtyStepper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SHOP_GREEN_BORDER,
    backgroundColor: SHOP_GREEN_LIGHT,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "900",
    color: SHOP_GREEN,
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
  featureTag: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 4,
    backgroundColor: SHOP_YELLOW_BG,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  featureTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: SHOP_YELLOW_TEXT,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  starRow: {
    flexDirection: "row",
    gap: 1,
  },
  reviewCount: {
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_LIGHT,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
    color: SHOP_ORANGE,
  },
  discount: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
    color: SHOP_BLUE,
  },
});
