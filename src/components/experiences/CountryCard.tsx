import { ResortImage } from "@/components/experiences/ResortImage";
import { EXP } from "@/constants/experienceTheme";
import type { CountryDestination } from "@/types/experienceCatalog";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type Props = {
  item: CountryDestination;
  onPress: () => void;
  featured?: boolean;
};

export function CountryCard({ item, onPress, featured = false }: Props) {
  const height = featured ? 280 : 220;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Plan trip to ${item.name}`}
      style={{
        marginBottom: 16,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: EXP.countries.from,
        shadowColor: "#0B1220",
        shadowOpacity: 0.16,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5,
      }}
    >
      <View style={{ position: "relative" }}>
        <ResortImage uri={item.imageUrl} height={height} />
        <LinearGradient
          colors={[
            "rgba(11,18,32,0.15)",
            "rgba(11,18,32,0.35)",
            "rgba(11,18,32,0.92)",
          ]}
          locations={[0, 0.45, 1]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            padding: 18,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {item.bestMonths ? (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.16)",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                  Best {item.bestMonths}
                </Text>
              </View>
            ) : (
              <View />
            )}
            {item.featured ? (
              <View
                style={{
                  backgroundColor: EXP.gold,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{ color: "#1C1917", fontSize: 11, fontWeight: "800" }}
                >
                  Featured
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1.6,
                textTransform: "uppercase",
              }}
            >
              {item.visaType || "Destination"}
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: featured ? 34 : 28,
                fontWeight: "800",
                letterSpacing: -0.6,
                lineHeight: featured ? 38 : 32,
              }}
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                color: "rgba(255,255,255,0.88)",
                fontSize: 14,
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              {item.bestFor}
            </Text>

            {item.tags.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                {item.tags.slice(0, 3).map((tag) => (
                  <View
                    key={tag}
                    style={{
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.28)",
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Starting from
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "800",
                    marginTop: 2,
                  }}
                >
                  {item.startingFrom}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                }}
              >
                <Text
                  style={{
                    color: EXP.countries.from,
                    fontSize: 13,
                    fontWeight: "800",
                  }}
                >
                  Plan trip
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={EXP.countries.from}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
