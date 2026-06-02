import { ResortImage } from "@/components/experiences/ResortImage";
import { Screen } from "@/components/ui/Screen";
import { ACCENT } from "@/constants/theme";
import { findResortById } from "@/services/resorts/getResortCatalog";
import { buildResortWhatsAppMessage } from "@/utils/resortBookingMessage";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");

export function ResortDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const resort = useMemo(
    () => (typeof id === "string" ? findResortById(id) : undefined),
    [id],
  );
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  if (!resort) {
    return (
      <Screen className="items-center justify-center bg-[#eef2fb] px-6">
        <Ionicons name="alert-circle-outline" size={40} color="#9ca3af" />
        <Text className="mt-3 text-center text-base font-bold text-neutral-800">
          Resort not found
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-full bg-accent px-5 py-2.5">
          <Text className="font-bold text-white">Go back</Text>
        </Pressable>
      </Screen>
    );
  }

  const images =
    resort.imageUrls.length > 0
      ? resort.imageUrls
      : [];
  const hero = images[imageIndex] ?? images[0];

  const bookWhatsApp = () => {
    openWhatsApp(
      buildResortWhatsAppMessage(resort, {
        roomType: selectedRoom ?? undefined,
      }),
    );
  };

  return (
    <Screen className="bg-[#eef2fb]" inset={false}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative">
          <ResortImage uri={hero} height={260} width={SCREEN_W} />
          <LinearGradient
            colors={["rgba(0,0,0,0.45)", "transparent", "rgba(0,0,0,0.55)"]}
            locations={[0, 0.35, 1]}
            className="absolute inset-0"
          />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="absolute left-4 rounded-full bg-black/35 p-2"
            style={{ top: insets.top + 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          {images.length > 1 ? (
            <View
              className="absolute bottom-3 flex-row justify-center gap-1.5"
              style={{ width: SCREEN_W }}
            >
              {images.map((_, i) => (
                <Pressable
                  key={`dot-${i}`}
                  onPress={() => setImageIndex(i)}
                  className={`h-2 rounded-full ${i === imageIndex ? "w-5 bg-white" : "w-2 bg-white/50"}`}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View className="-mt-6 mx-4 overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-lg">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-[22px] font-extrabold leading-7 text-neutral-900">
              {resort.name}
            </Text>
            {resort.tripadvisorRating != null ? (
              <View className="flex-row items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5">
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text className="text-sm font-extrabold text-amber-900">
                  {resort.tripadvisorRating.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-center gap-1">
            <Ionicons name="location" size={16} color={ACCENT} />
            <Text className="flex-1 text-[13px] font-semibold text-neutral-600">
              {resort.location}
              {resort.region ? ` · ${resort.region}` : ""} · {resort.state}
            </Text>
          </View>

          {resort.estimatedPriceLabel ? (
            <View className="mt-4 rounded-2xl bg-accent-soft px-4 py-3">
              <Text className="text-[11px] font-extrabold uppercase tracking-wider text-accent-muted">
                Estimated price (next week)
              </Text>
              <Text className="mt-1 text-[20px] font-extrabold text-accent-deep">
                {resort.estimatedPriceLabel}
              </Text>
              <Text className="mt-0.5 text-[12px] text-neutral-500">
                Per night · subject to availability
              </Text>
            </View>
          ) : null}

          <View className="mt-4 flex-row flex-wrap gap-2">
            {resort.priceTier ? (
              <Badge label={`Price: ${resort.priceTier}`} highlight />
            ) : null}
            {resort.roomQuality ? (
              <Badge label={`Rooms: ${resort.roomQuality}`} />
            ) : null}
            {resort.destinationTier ? (
              <Badge label={`Destination: ${resort.destinationTier}`} />
            ) : null}
            {resort.category ? <Badge label={resort.category} /> : null}
          </View>

          {resort.experienceTypes.length > 0 ? (
            <>
              <SectionTitle>Experience</SectionTitle>
              <View className="flex-row flex-wrap gap-2">
                {resort.experienceTypes.map((t) => (
                  <Badge key={t} label={t} />
                ))}
              </View>
            </>
          ) : null}

          {resort.roomTypes.length > 0 ? (
            <>
              <SectionTitle>Room options</SectionTitle>
              <Text className="mb-2 text-[12px] text-neutral-500">
                Tap a room to include it in your WhatsApp request
              </Text>
              <View className="gap-2">
                {resort.roomTypes.map((room) => {
                  const on = selectedRoom === room;
                  return (
                    <Pressable
                      key={room}
                      onPress={() => setSelectedRoom(on ? null : room)}
                      className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                        on ? "border-accent bg-accent-soft" : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      <Text
                        className={`flex-1 text-[14px] font-semibold ${on ? "text-accent-deep" : "text-neutral-800"}`}
                      >
                        {room}
                      </Text>
                      {on ? (
                        <Ionicons name="checkmark-circle" size={20} color={ACCENT} />
                      ) : (
                        <Ionicons name="ellipse-outline" size={20} color="#d1d5db" />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>

        {images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {images.map((uri, i) => (
              <Pressable key={`${uri}-${i}`} onPress={() => setImageIndex(i)}>
                <ResortImage
                  uri={uri}
                  height={80}
                  width={112}
                  borderRadius={16}
                  style={
                    i === imageIndex
                      ? { borderWidth: 2, borderColor: ACCENT }
                      : undefined
                  }
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View className="mx-4 mt-6 gap-3">
          <Pressable
            onPress={bookWhatsApp}
            accessibilityRole="button"
            accessibilityLabel="Book via WhatsApp"
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 active:opacity-90"
            style={{
              shadowColor: "#15803d",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 6,
            }}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#fff" />
            <Text className="text-[16px] font-extrabold text-white">Book via WhatsApp</Text>
          </Pressable>

          {resort.websiteUrl ? (
            <Pressable
              onPress={() => Linking.openURL(resort.websiteUrl!)}
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 active:opacity-90"
            >
              <Ionicons name="globe-outline" size={20} color={ACCENT} />
              <Text className="text-[15px] font-bold text-accent-deep">Visit official website</Text>
            </Pressable>
          ) : null}

          <View className="flex-row items-start gap-2 rounded-2xl bg-white/80 px-3 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
            <Text className="flex-1 text-[12px] leading-[18px] text-neutral-500">
              InstaHelp concierge will confirm availability and best rates on WhatsApp. Prices
              shown are estimates from our resort list.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-2 mt-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
      {children}
    </Text>
  );
}

function Badge({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <View
      className={
        highlight
          ? "rounded-full bg-amber-50 px-3 py-1"
          : "rounded-full bg-neutral-100 px-3 py-1"
      }
    >
      <Text
        className={
          highlight
            ? "text-[11px] font-bold text-amber-900"
            : "text-[11px] font-semibold text-neutral-700"
        }
      >
        {label}
      </Text>
    </View>
  );
}
