import { ResortImage } from "@/components/experiences/ResortImage";
import { EXP } from "@/constants/experienceTheme";
import type { HolidayPackage } from "@/types/experienceCatalog";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

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
      style={{
        marginBottom: 16,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: EXP.white,
        borderWidth: 1,
        borderColor: EXP.line,
        shadowColor: "#042F2E",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}
    >
      <View style={{ position: "relative" }}>
        <ResortImage uri={thumb} height={176} />
        <LinearGradient
          colors={["transparent", "rgba(4,47,46,0.15)", "rgba(4,47,46,0.88)"]}
          locations={[0.35, 0.65, 1]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            justifyContent: "flex-end",
            padding: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                {item.duration}
              </Text>
            </View>
            {item.budgetTier ? (
              <View
                style={{
                  backgroundColor: EXP.goldSoft,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{ color: "#92400E", fontSize: 11, fontWeight: "800" }}
                >
                  {item.budgetTier}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            numberOfLines={2}
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "800",
              lineHeight: 23,
            }}
          >
            {item.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
            }}
          >
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text
              numberOfLines={1}
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 12,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {item.destination}
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 14, paddingVertical: 14, gap: 10 }}>
        {item.highlights.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {item.highlights.slice(0, 3).map((h) => (
              <View
                key={h}
                style={{
                  backgroundColor: EXP.holidays.soft,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    color: EXP.holidays.from,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {h}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                color: EXP.muted,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              From
            </Text>
            <Text
              style={{
                color: EXP.holidays.mid,
                fontSize: 16,
                fontWeight: "800",
                marginTop: 2,
              }}
            >
              {item.priceFrom.replace(/^From\s+/i, "")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: EXP.holidays.from,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>
              Enquire
            </Text>
            <Ionicons name="logo-whatsapp" size={16} color="#fff" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
