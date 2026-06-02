import { ResortImage } from "@/components/experiences/ResortImage";
import type { ResortRecord } from "@/types/resortExperience";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  resort: ResortRecord;
  onPress: () => void;
};

function TierPill({ label, tone }: { label: string; tone?: "gold" | "muted" }) {
  return (
    <View
      className={
        tone === "gold"
          ? "rounded-full bg-amber-50 px-2 py-0.5"
          : "rounded-full bg-neutral-100 px-2 py-0.5"
      }
    >
      <Text
        className={
          tone === "gold"
            ? "text-[10px] font-bold text-amber-800"
            : "text-[10px] font-semibold text-neutral-600"
        }
      >
        {label}
      </Text>
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${resort.name}, ${resort.location}`}
      className="mb-4 overflow-hidden rounded-[22px] border border-neutral-100 bg-white active:opacity-95"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 4,
      }}
    >
      <View className="relative">
        <ResortImage uri={thumb} height={168} />
        {resort.rank != null && resort.rank <= 10 ? (
          <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full bg-black/55 px-2.5 py-1">
            <Ionicons name="trophy" size={12} color="#ffd500" />
            <Text className="text-[11px] font-extrabold text-white">Top {resort.rank}</Text>
          </View>
        ) : null}
        {rating ? (
          <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-white/95 px-2 py-1">
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text className="text-[11px] font-extrabold text-neutral-900">{rating}</Text>
          </View>
        ) : null}
      </View>

      <View className="gap-2 p-4">
        <Text className="text-[17px] font-extrabold leading-[22px] text-neutral-900" numberOfLines={2}>
          {resort.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text className="flex-1 text-[12px] font-semibold text-neutral-500" numberOfLines={1}>
            {resort.location}
            {resort.region ? ` · ${resort.region}` : ""} · {resort.state}
          </Text>
        </View>
        {resort.estimatedPriceLabel ? (
          <Text className="text-[14px] font-extrabold text-accent-deep">
            {resort.estimatedPriceLabel}
            <Text className="text-[11px] font-semibold text-neutral-500"> / night est.</Text>
          </Text>
        ) : null}
        <View className="mt-1 flex-row flex-wrap gap-1.5">
          {resort.priceTier ? <TierPill label={resort.priceTier} tone="gold" /> : null}
          {resort.category ? <TierPill label={resort.category} /> : null}
          {resort.experienceTypes.slice(0, 2).map((t) => (
            <TierPill key={t} label={t} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}
