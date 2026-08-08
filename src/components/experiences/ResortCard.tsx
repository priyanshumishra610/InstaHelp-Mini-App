import { ResortImage } from "@/components/experiences/ResortImage";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { EXP } from "@/constants/experienceTheme";
import type { ResortRecord } from "@/types/resortExperience";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  resort: ResortRecord;
  onPress: () => void;
};

type Amenity = {
  key: string;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
};

function resolveAmenities(resort: ResortRecord): Amenity[] {
  const source = [
    ...resort.experienceTypes,
    resort.category ?? "",
    ...resort.roomTypes,
  ]
    .join(" ")
    .toLowerCase();

  const catalog: Amenity[] = [
    { key: "pool", label: "Pool", icon: "pool" },
    { key: "beach", label: "Beachfront", icon: "beach" },
    { key: "spa", label: "Spa", icon: "spa-outline" },
    { key: "wifi", label: "Free Wi-Fi", icon: "wifi" },
    { key: "restaurant", label: "Dining", icon: "silverware-fork-knife" },
    { key: "view", label: "Views", icon: "image-filter-hdr" },
  ];

  const matched = catalog.filter((item) => {
    if (item.key === "beach") {
      return /beach|sea|coast|ocean|shore/.test(source);
    }
    if (item.key === "pool") return /pool|swim/.test(source);
    if (item.key === "spa") return /spa|wellness|ayurveda/.test(source);
    if (item.key === "wifi") return /wifi|wi-fi|internet/.test(source);
    if (item.key === "restaurant") {
      return /dining|restaurant|culinary|food/.test(source);
    }
    if (item.key === "view") return /view|mountain|lake|valley/.test(source);
    return false;
  });

  if (matched.length >= 2) return matched.slice(0, 4);

  const fallback: Amenity[] = [
    { key: "pool", label: "Pool", icon: "pool" },
    { key: "spa", label: "Spa", icon: "spa-outline" },
    { key: "wifi", label: "Free Wi-Fi", icon: "wifi" },
  ];
  if (/goa|beach|coast|andaman|lakshadweep/i.test(`${resort.state} ${resort.location}`)) {
    fallback.unshift({ key: "beach", label: "Beachfront", icon: "beach" });
  }
  return fallback.slice(0, 4);
}

function formatPrice(label: string | null): string | null {
  if (!label) return null;
  const cleaned = label.replace(/\s*\/\s*night/i, "").trim();
  if (/₹|rs\.?/i.test(cleaned)) return `${cleaned} / night`;
  return `₹${cleaned} / night`;
}

export function ResortCard({ resort, onPress }: Props) {
  const [saved, setSaved] = useState(false);
  const thumb = resort.imageUrls[0];
  const rating =
    resort.tripadvisorRating != null
      ? resort.tripadvisorRating.toFixed(1)
      : null;
  const amenities = resolveAmenities(resort);
  const price = formatPrice(resort.estimatedPriceLabel);
  const locationLine = [resort.location || resort.region, resort.state]
    .filter(Boolean)
    .join(", ");

  return (
    <AnimatedPressable
      onPress={onPress}
      haptic
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${resort.name}, ${locationLine}`}
      style={styles.card}
    >
      <View style={styles.media}>
        <ResortImage uri={thumb} height={168} borderRadius={18} />
        {resort.rank != null && resort.rank > 0 && resort.rank <= 20 ? (
          <View style={styles.rankBadge}>
            <AppIcon name="trophy-outline" size={12} color={EXP.goldDeep} />
            <Text style={[styles.rankText, { fontFamily: AUTH_FONT.bold }]}>
              Top {resort.rank}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={2}
            style={[styles.title, { fontFamily: AUTH_FONT.bold }]}
          >
            {resort.name}
          </Text>
          <Pressable
            onPress={() => setSaved((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove favorite" : "Save favorite"}
            style={styles.heartBtn}
          >
            <AppIcon
              name={saved ? "heart" : "heartOutline"}
              size={20}
              color={saved ? "#E11D48" : EXP.muted}
            />
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <AppIcon name="map-marker-outline" size={14} color={EXP.muted} />
          <Text
            numberOfLines={1}
            style={[styles.metaText, { fontFamily: AUTH_FONT.medium }]}
          >
            {locationLine}
          </Text>
        </View>

        {rating ? (
          <View style={styles.metaRow}>
            <AppIcon name="star" size={14} color={EXP.gold} />
            <Text style={[styles.ratingValue, { fontFamily: AUTH_FONT.bold }]}>
              {rating}
            </Text>
            <Text style={[styles.reviewText, { fontFamily: AUTH_FONT.regular }]}>
              Tripadvisor
            </Text>
          </View>
        ) : null}

        <View style={styles.amenityRow}>
          {amenities.map((item) => (
            <View key={item.key} style={styles.amenityChip}>
              <MaterialCommunityIcons
                name={item.icon}
                size={13}
                color={EXP.primary}
              />
              <Text
                style={[styles.amenityLabel, { fontFamily: AUTH_FONT.medium }]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.priceCol}>
            {price ? (
              <>
                <Text
                  numberOfLines={1}
                  style={[styles.price, { fontFamily: AUTH_FONT.bold }]}
                >
                  {price}
                </Text>
                <Text
                  style={[styles.priceHint, { fontFamily: AUTH_FONT.regular }]}
                >
                  Includes taxes
                </Text>
              </>
            ) : (
              <Text style={[styles.priceHint, { fontFamily: AUTH_FONT.medium }]}>
                Price on request
              </Text>
            )}
          </View>
          <View style={styles.cta}>
            <Text style={[styles.ctaLabel, { fontFamily: AUTH_FONT.bold }]}>
              View details
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: EXP.white,
    borderWidth: 1,
    borderColor: EXP.line,
    overflow: "hidden",
    shadowColor: "#1B4D3E",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  media: {
    padding: 12,
    paddingBottom: 0,
  },
  rankBadge: {
    position: "absolute",
    left: 22,
    top: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rankText: {
    fontSize: 11,
    color: EXP.ink,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    color: EXP.ink,
  },
  heartBtn: {
    paddingTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    color: EXP.muted,
  },
  ratingValue: {
    fontSize: 13,
    color: EXP.ink,
  },
  reviewText: {
    fontSize: 12,
    color: EXP.muted,
  },
  amenityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amenityLabel: {
    fontSize: 11,
    color: EXP.muted,
  },
  footer: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceCol: {
    flex: 1,
    minWidth: 0,
  },
  price: {
    fontSize: 16,
    color: EXP.ink,
  },
  priceHint: {
    marginTop: 2,
    fontSize: 11,
    color: EXP.muted,
  },
  cta: {
    backgroundColor: EXP.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  ctaLabel: {
    color: "#fff",
    fontSize: 13,
  },
});
