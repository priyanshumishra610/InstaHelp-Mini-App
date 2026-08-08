import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS, cardShadow } from "@/constants/designSystem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ServiceItem = {
  id: string;
  name: string;
  vendors: number;
  rating: number;
  reviews: number;
  image: string;
  search: string;
};

const POPULAR: ServiceItem[] = [
  {
    id: "3d-printing",
    name: "3D Printing",
    vendors: 31,
    rating: 4.6,
    reviews: 120,
    image:
      "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=70",
    search: "3D Printing",
  },
  {
    id: "laptop-repair",
    name: "Laptop Repair",
    vendors: 48,
    rating: 4.8,
    reviews: 210,
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=70",
    search: "Laptop Repair",
  },
  {
    id: "home-cleaning",
    name: "Home Cleaning",
    vendors: 92,
    rating: 4.7,
    reviews: 340,
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70",
    search: "Home Cleaning",
  },
  {
    id: "packers-movers",
    name: "Packers & Movers",
    vendors: 56,
    rating: 4.5,
    reviews: 180,
    image:
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&q=70",
    search: "Packers Movers",
  },
];

type Props = {
  onSearch: (query: string) => void;
  onViewAll?: () => void;
};

export function HomePopularServices({ onSearch, onViewAll }: Props) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: AUTH_FONT.bold, color: colors.ink }]}>
          Popular services
        </Text>
        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.viewAll, pressed && { opacity: 0.7 }]}
        >
          <Text
            style={[
              styles.viewAllText,
              { fontFamily: AUTH_FONT.semibold, color: colors.inkMuted },
            ]}
          >
            View all
          </Text>
          <AppIcon name="chevronRight" size={16} color={colors.inkMuted} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {POPULAR.map((service) => (
          <View key={service.id} style={styles.cardWrap}>
            <Pressable
              onPress={() => onSearch(service.search)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                },
                cardShadow("card"),
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.imageWrap,
                  { backgroundColor: colors.surfaceMuted },
                ]}
              >
                <Image
                  source={{ uri: service.image }}
                  style={styles.image}
                  contentFit="cover"
                  transition={0}
                  recyclingKey={service.id}
                />
                <LinearGradient
                  colors={["transparent", "rgba(28,25,23,0.28)"]}
                  start={{ x: 0.5, y: 0.35 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.imageScrim}
                />
                <Pressable
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Save ${service.name}`}
                  style={[
                    styles.heartBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(39,39,42,0.92)"
                        : "rgba(255,255,255,0.92)",
                      borderColor: colors.line,
                    },
                  ]}
                >
                  <AppIcon name="heart" size={16} color={colors.inkMuted} />
                </Pressable>
              </View>

              <View style={styles.meta}>
                <Text
                  style={[
                    styles.serviceName,
                    { fontFamily: AUTH_FONT.bold, color: colors.ink },
                  ]}
                  numberOfLines={1}
                >
                  {service.name}
                </Text>
                <Text
                  style={[
                    styles.vendorCount,
                    { fontFamily: AUTH_FONT.medium, color: colors.inkMuted },
                  ]}
                >
                  {service.vendors} vendors
                </Text>
                <View style={styles.ratingRow}>
                  <AppIcon name="star" size={12} color={colors.ink} filled />
                  <Text
                    style={[
                      styles.rating,
                      { fontFamily: AUTH_FONT.semibold, color: colors.ink },
                    ]}
                  >
                    {service.rating.toFixed(1)}
                  </Text>
                  <Text
                    style={[
                      styles.reviews,
                      { fontFamily: AUTH_FONT.regular, color: colors.inkSubtle },
                    ]}
                  >
                    ({service.reviews})
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.35,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardWrap: {
    width: "47%",
    flexGrow: 1,
  },
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    height: 112,
    position: "relative",
    overflow: "hidden",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 3,
  },
  serviceName: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  vendorCount: {
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
  },
  reviews: {
    fontSize: 11,
  },
});
