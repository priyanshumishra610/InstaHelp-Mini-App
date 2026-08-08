import { ResortImage } from "@/components/experiences/ResortImage";
import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { EXP } from "@/constants/experienceTheme";
import type { HolidayPackage } from "@/types/experienceCatalog";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: HolidayPackage;
  onPress: () => void;
};

export function HolidayCard({ item, onPress }: Props) {
  const thumb = item.imageUrls[0];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Enquire about ${item.title}`}
      style={styles.card}
    >
      <View style={styles.media}>
        <ResortImage uri={thumb} height={168} borderRadius={18} />
        <LinearGradient
          colors={["transparent", "rgba(15,51,41,0.55)"]}
          locations={[0.45, 1]}
          style={styles.mediaWash}
        />
        <View style={styles.durationBadge}>
          <Text style={[styles.durationText, { fontFamily: AUTH_FONT.bold }]}>
            {item.duration}
          </Text>
        </View>
        {item.budgetTier ? (
          <View style={styles.tierBadge}>
            <Text style={[styles.tierText, { fontFamily: AUTH_FONT.bold }]}>
              {item.budgetTier}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text
          numberOfLines={2}
          style={[styles.title, { fontFamily: AUTH_FONT.bold }]}
        >
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <AppIcon name="map-marker-outline" size={14} color={EXP.muted} />
          <Text
            numberOfLines={1}
            style={[styles.metaText, { fontFamily: AUTH_FONT.medium }]}
          >
            {item.destination}
          </Text>
        </View>

        {item.highlights.length > 0 ? (
          <View style={styles.highlightRow}>
            {item.highlights.slice(0, 3).map((h) => (
              <View key={h} style={styles.highlightChip}>
                <Text
                  style={[
                    styles.highlightText,
                    { fontFamily: AUTH_FONT.semibold },
                  ]}
                >
                  {h}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.priceCol}>
            <Text style={[styles.fromLabel, { fontFamily: AUTH_FONT.semibold }]}>
              From
            </Text>
            <Text style={[styles.price, { fontFamily: AUTH_FONT.bold }]}>
              {item.priceFrom.replace(/^From\s+/i, "")}
            </Text>
          </View>
          <View style={styles.cta}>
            <Text style={[styles.ctaLabel, { fontFamily: AUTH_FONT.bold }]}>
              Enquire
            </Text>
            <AppIcon name="arrowForward" size={15} color="#fff" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: EXP.white,
    borderWidth: 1,
    borderColor: EXP.line,
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
  mediaWash: {
    ...StyleSheet.absoluteFillObject,
    margin: 12,
    marginBottom: 0,
    borderRadius: 18,
  },
  durationBadge: {
    position: "absolute",
    left: 22,
    top: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  durationText: {
    color: EXP.ink,
    fontSize: 11,
  },
  tierBadge: {
    position: "absolute",
    right: 22,
    top: 22,
    backgroundColor: EXP.goldSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tierText: {
    color: "#92400E",
    fontSize: 11,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    color: EXP.ink,
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
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  highlightChip: {
    backgroundColor: EXP.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  highlightText: {
    color: EXP.primary,
    fontSize: 11,
  },
  footer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceCol: {
    flex: 1,
    minWidth: 0,
  },
  fromLabel: {
    color: EXP.muted,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  price: {
    color: EXP.ink,
    fontSize: 16,
    marginTop: 2,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: EXP.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  ctaLabel: {
    color: "#fff",
    fontSize: 13,
  },
});
