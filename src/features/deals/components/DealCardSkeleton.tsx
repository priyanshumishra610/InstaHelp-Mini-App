import {
  SHOP_GREEN,
  SHOP_TEXT,
  SHOP_TEXT_LIGHT,
  SHOP_TEXT_MUTED,
} from "@/constants/shopTheme";
import { StyleSheet, View, type ViewStyle } from "react-native";

type Props = {
  width: number;
  style?: ViewStyle;
};

export function DealCardSkeleton({ width, style }: Props) {
  return (
    <View style={[styles.card, { width }, style]}>
      <View style={styles.image} />
      <View style={styles.lineWide} />
      <View style={styles.lineMid} />
      <View style={styles.priceRow}>
        <View style={styles.price} />
        <View style={styles.mrp} />
      </View>
      <View style={styles.btn} />
    </View>
  );
}

export function DealCarouselSkeleton({ cardWidth }: { cardWidth: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 3 }).map((_, i) => (
        <DealCardSkeleton key={`skel-${i}`} width={cardWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 8,
  },
  card: {
    marginBottom: 8,
  },
  image: {
    height: 130,
    borderRadius: 12,
    backgroundColor: "#ececec",
  },
  lineWide: {
    marginTop: 10,
    height: 12,
    width: "90%",
    borderRadius: 4,
    backgroundColor: "#ececec",
  },
  lineMid: {
    marginTop: 6,
    height: 10,
    width: "60%",
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  priceRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  price: {
    height: 14,
    width: 48,
    borderRadius: 4,
    backgroundColor: "#ececec",
  },
  mrp: {
    height: 12,
    width: 40,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  btn: {
    marginTop: 10,
    height: 28,
    width: 72,
    alignSelf: "flex-end",
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
  },
});
