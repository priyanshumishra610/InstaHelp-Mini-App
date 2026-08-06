import type { WeeklyOffer } from "@/types/offers";
import { ACCENT, ACCENT_DEEP } from "@/constants/theme";
import { discoveryImpact } from "@/utils/discoveryHaptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

const CARD_GAP = 12;

function formatCountdown(endsAt: number): string | null {
  const diff = endsAt - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

type OfferCardProps = {
  offer: WeeklyOffer;
  index: number;
  scrollX: SharedValue<number>;
  cardWidth: number;
  onPress: (offer: WeeklyOffer) => void;
};

function OfferCardComponent({
  offer,
  index,
  scrollX,
  cardWidth,
  onPress,
}: OfferCardProps) {
  const isWeekOffer = offer.id === "offer-week-home";
  const [countdown, setCountdown] = useState<string | null>(() =>
    offer.timerEndsAt ? formatCountdown(offer.timerEndsAt) : null,
  );

  useEffect(() => {
    if (!offer.timerEndsAt) return;
    const tick = () => setCountdown(formatCountdown(offer.timerEndsAt!));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [offer.timerEndsAt]);

  const animatedStyle = useAnimatedStyle(() => {
    const stride = cardWidth + CARD_GAP;
    const inputRange = [(index - 1) * stride, index * stride, (index + 1) * stride];
    const scale = interpolate(scrollX.value, inputRange, [0.94, 1, 0.94], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [6, 0, 6], Extrapolation.CLAMP);
    // Avoid fading critical content (e.g. the featured weekly offer) via parent opacity.
    const opacity = isWeekOffer
      ? 1
      : interpolate(scrollX.value, inputRange, [0.94, 1, 0.94], Extrapolation.CLAMP);
    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[{ width: cardWidth }, animatedStyle]}>
      <Pressable
        onPress={() => {
          discoveryImpact("light");
          onPress(offer);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${offer.title}. ${offer.subtitle}`}
        className="overflow-hidden rounded-[24px] active:opacity-[0.97]"
        style={{
          // Keep all offer cards visually consistent (including "Offer of the Week").
          shadowColor: "#0f172a",
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        {offer.image ? (
          <Image
            source={offer.image}
            resizeMode="cover"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
        ) : null}
        {offer.image ? (
          <LinearGradient
            colors={["rgba(15,23,42,0.64)", "rgba(15,23,42,0.22)", "rgba(15,23,42,0.58)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
        ) : null}
        <LinearGradient
          colors={
            offer.image
              ? ["rgba(255,255,255,0)", "rgba(255,255,255,0)"]
                : [offer.gradient[0], offer.gradient[1]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: 156,
            paddingHorizontal: 18,
            paddingVertical: 18,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View
              className="flex-1 gap-2"
              style={{
                maxWidth: "72%",
                alignItems: "flex-start",
              }}
            >
              {offer.tag ? (
                <View
                  className="rounded-full border px-2.5 py-1"
                  style={{
                    alignSelf: "flex-start",
                    borderColor: offer.image ? "rgba(255,255,255,0.28)" : "rgba(23,23,23,0.08)",
                    backgroundColor: offer.image
                      ? "rgba(255,255,255,0.26)"
                        : "rgba(255,255,255,0.7)",
                  }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: offer.image ? "#f8fafc" : "#525252" }}
                  >
                    {offer.tag}
                  </Text>
                </View>
              ) : null}
              {offer.badge ? (
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: offer.image
                      ? "rgba(255,255,255,0.24)"
                      : isWeekOffer
                        ? "rgba(124, 58, 237, 0.14)"
                        : `${ACCENT}14`,
                  }}
                >
                  <Text
                    className="text-[10px] font-extrabold uppercase tracking-wide"
                    style={{ color: offer.image ? "#f8fafc" : isWeekOffer ? "#0C0A09" : ACCENT_DEEP }}
                  >
                    {offer.badge}
                  </Text>
                </View>
              ) : null}
              <Text
                className="font-extrabold tracking-tight text-neutral-900"
                style={{
                  fontSize: isWeekOffer ? 19 : 18,
                  lineHeight: isWeekOffer ? 23 : 22,
                  textAlign: "left",
                  color: offer.image ? "#ffffff" : "#171717",
                }}
              >
                {offer.title}
              </Text>
              <Text
                className="leading-[18px]"
                numberOfLines={2}
                style={{
                  fontSize: isWeekOffer ? 13.5 : 13,
                  color: offer.image ? "rgba(255,255,255,0.92)" : isWeekOffer ? "#3f4f78" : "#525252",
                  textAlign: "left",
                }}
              >
                {offer.subtitle}
              </Text>
              {countdown ? (
                <View
                  className="mt-0.5 flex-row items-center gap-1"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={offer.image ? "#e5e7eb" : isWeekOffer ? "#33539e" : "#737373"}
                  />
                  <Text
                    className="text-[11px] font-semibold"
                    style={{ color: offer.image ? "#e5e7eb" : isWeekOffer ? "#33539e" : "#737373" }}
                  >
                    {countdown}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="items-center justify-center">
              {offer.icon ? (
                <View
                  className="items-center justify-center rounded-2xl border"
                  style={{
                    width: 56,
                    height: 56,
                    borderColor: offer.image
                      ? "rgba(255,255,255,0.75)"
                      : isWeekOffer
                        ? "rgba(255,255,255,0.92)"
                        : "rgba(255,255,255,0.8)",
                    backgroundColor: offer.image
                      ? "rgba(17,24,39,0.28)"
                      : isWeekOffer
                        ? "rgba(255,255,255,0.78)"
                        : "rgba(255,255,255,0.55)",
                    shadowColor: ACCENT,
                    shadowOpacity: isWeekOffer ? 0.2 : 0.12,
                    shadowRadius: isWeekOffer ? 16 : 12,
                    shadowOffset: { width: 0, height: isWeekOffer ? 6 : 4 },
                  }}
                >
                  <Ionicons
                    name={offer.icon}
                    size={26}
                    color={offer.image ? "#f3f4f6" : ACCENT}
                  />
                </View>
              ) : null}
            </View>
          </View>

          <View className="mt-4 flex-row items-center">
            <View
              className="flex-row items-center gap-1.5 rounded-full px-4 py-2.5"
              style={{
                backgroundColor: isWeekOffer ? "#0a3f92" : "#171717",
              }}
            >
              <Text className="text-[12px] font-extrabold text-white">{offer.cta}</Text>
              <Ionicons name="arrow-forward" size={14} color="#ffffff" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export const OfferCard = memo(OfferCardComponent);
