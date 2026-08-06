import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { ResortImage } from "@/components/experiences/ResortImage";
import { GLASS, claySurface } from "@/constants/designSystem";
import { EXP } from "@/constants/experienceTheme";
import type { ResortRecord } from "@/types/resortExperience";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

type Props = {
  resort: ResortRecord;
  onPress: () => void;
};

function Pill({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: "gold" | "muted" | "violet";
}) {
  const bg =
    tone === "gold"
      ? EXP.goldSoft
      : tone === "violet"
        ? EXP.resorts.soft
        : "rgba(241,245,249,0.85)";
  const color =
    tone === "gold" ? "#92400E" : tone === "violet" ? EXP.resorts.mid : EXP.muted;
  return (
    <View
      style={{
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.65)",
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color }}>{label}</Text>
    </View>
  );
}

function GlassChip({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[{ borderRadius: 999, overflow: "hidden" }, style]}>
      {Platform.OS !== "web" ? (
        <BlurView intensity={36} tint="light" style={StyleSheet.absoluteFill} />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(255,255,255,0.55)" },
        ]}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: GLASS.border,
          borderRadius: 999,
        }}
      >
        {children}
      </View>
    </View>
  );
}

export function ResortCard({ resort, onPress }: Props) {
  const thumb = resort.imageUrls[0];
  const rating =
    resort.tripadvisorRating != null
      ? resort.tripadvisorRating.toFixed(1)
      : null;

  return (
    <AnimatedPressable
      onPress={onPress}
      haptic
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${resort.name}, ${resort.location}`}
      style={{
        marginBottom: 16,
        overflow: "hidden",
        ...claySurface(24),
      }}
    >
      <View style={{ position: "relative" }}>
        <ResortImage uri={thumb} height={178} />
        <LinearGradient
          colors={["rgba(15,23,42,0.05)", "transparent", "rgba(15,23,42,0.55)"]}
          locations={[0, 0.45, 1]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        {resort.rank != null && resort.rank <= 10 ? (
          <View style={{ position: "absolute", left: 12, top: 12 }}>
            <GlassChip>
              <Ionicons name="trophy" size={12} color={EXP.gold} />
              <Text style={{ color: EXP.ink, fontSize: 11, fontWeight: "800" }}>
                Top {resort.rank}
              </Text>
            </GlassChip>
          </View>
        ) : null}
        {rating ? (
          <View style={{ position: "absolute", right: 12, top: 12 }}>
            <GlassChip>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={{ color: EXP.ink, fontSize: 11, fontWeight: "800" }}>
                {rating}
              </Text>
            </GlassChip>
          </View>
        ) : null}
        {resort.estimatedPriceLabel ? (
          <View style={{ position: "absolute", left: 12, bottom: 12, maxWidth: "70%" }}>
            <View
              style={{
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: GLASS.border,
              }}
            >
              {Platform.OS !== "web" ? (
                <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
              ) : null}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: "rgba(255,255,255,0.62)" },
                ]}
              />
              <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: EXP.muted, fontSize: 10, fontWeight: "700" }}>
                  EST. / NIGHT
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: EXP.resorts.mid,
                    fontSize: 14,
                    fontWeight: "800",
                    marginTop: 1,
                  }}
                >
                  {/₹|rs\.?/i.test(resort.estimatedPriceLabel)
                    ? resort.estimatedPriceLabel
                    : `₹${resort.estimatedPriceLabel}`}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      <View style={{ padding: 14, gap: 8 }}>
        <Text
          numberOfLines={2}
          style={{
            color: EXP.ink,
            fontSize: 17,
            fontWeight: "800",
            lineHeight: 22,
          }}
        >
          {resort.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="location-outline" size={14} color={EXP.muted} />
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              color: EXP.muted,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {resort.location}
            {resort.region ? ` · ${resort.region}` : ""} · {resort.state}
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {resort.priceTier ? (
            <Pill
              label={
                resort.priceTier === "High"
                  ? "Premium"
                  : resort.priceTier === "Mid"
                    ? "Mid-range"
                    : resort.priceTier === "Low"
                      ? "Budget"
                      : resort.priceTier
              }
              tone="gold"
            />
          ) : null}
          {resort.category ? <Pill label={resort.category} tone="violet" /> : null}
          {resort.experienceTypes.slice(0, 2).map((t) => (
            <Pill key={t} label={t} />
          ))}
        </View>
      </View>
    </AnimatedPressable>
  );
}
