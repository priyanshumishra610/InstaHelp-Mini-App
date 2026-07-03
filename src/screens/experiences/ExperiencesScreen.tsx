import { ResortCard } from "@/components/experiences/ResortCard";
import { Screen } from "@/components/ui/Screen";
import { ACCENT } from "@/constants/theme";
import {
  filterResorts,
  getAllResorts,
  getResortCatalogMeta,
} from "@/services/resorts/getResortCatalog";
import type { ResortRecord } from "@/types/resortExperience";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRICE_FILTERS = [
  { id: null, label: "All prices" },
  { id: "High", label: "Premium" },
  { id: "Mid", label: "Mid-range" },
  { id: "Low", label: "Budget" },
] as const;

type GeneratedTripDay = {
  day: number;
  title: string;
  resort: ResortRecord;
  note: string;
};

type GeneratedTrip = {
  title: string;
  subtitle: string;
  sourceCount: number;
  days: GeneratedTripDay[];
};

const TRIP_DAY_TITLES = [
  "Arrival stay",
  "Signature experience",
  "Slow day",
  "Final night",
] as const;

function includesQuery(resort: ResortRecord, query: string) {
  if (!query) return true;
  const haystack = [
    resort.name,
    resort.location,
    resort.state,
    resort.region,
    resort.category,
    resort.estimatedPriceLabel,
    ...resort.experienceTypes,
    ...resort.roomTypes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function scoreResort(resort: ResortRecord, query: string, priceFilter: string | null) {
  const rankScore =
    resort.rank != null && resort.rank > 0 ? Math.max(0, 120 - resort.rank) : 10;
  const ratingScore = resort.tripadvisorRating != null ? resort.tripadvisorRating * 10 : 0;
  const imageScore = Math.min(resort.imageUrls.length, 3) * 4;
  const priceScore = priceFilter && resort.priceTier === priceFilter ? 25 : 0;
  const queryScore = query && includesQuery(resort, query) ? 20 : 0;
  return rankScore + ratingScore + imageScore + priceScore + queryScore;
}

function buildTripPlan(
  resorts: ResortRecord[],
  filters: { query: string; state: string | null; priceTier: string | null },
): GeneratedTrip | null {
  const query = filters.query.trim().toLowerCase();
  const narrowed = resorts.filter((resort) => {
    if (filters.state && resort.state !== filters.state) return false;
    if (filters.priceTier && resort.priceTier !== filters.priceTier) return false;
    return includesQuery(resort, query);
  });

  const source =
    narrowed.length >= 3 ? narrowed : resorts.filter((resort) => includesQuery(resort, query));
  const ranked = source
    .map((resort) => ({
      resort,
      score: scoreResort(resort, query, filters.priceTier),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ resort }) => resort);

  const picked: ResortRecord[] = [];
  const seenRegions = new Set<string>();
  for (const resort of ranked) {
    const regionKey = `${resort.state}:${resort.region || resort.location}`;
    if (picked.length < TRIP_DAY_TITLES.length && !seenRegions.has(regionKey)) {
      picked.push(resort);
      seenRegions.add(regionKey);
    }
    if (picked.length >= TRIP_DAY_TITLES.length) break;
  }

  for (const resort of ranked) {
    if (picked.length >= TRIP_DAY_TITLES.length) break;
    if (!picked.some((p) => p.id === resort.id)) picked.push(resort);
  }

  if (picked.length === 0) return null;

  const destinationLabel = filters.state ?? picked[0]?.state ?? "India";
  return {
    title: `${Math.min(picked.length, TRIP_DAY_TITLES.length)}-day ${destinationLabel} plan`,
    subtitle: `AI-style itinerary generated from ${source.length} matching stays across the full catalog.`,
    sourceCount: source.length,
    days: picked.map((resort, index) => ({
      day: index + 1,
      title: TRIP_DAY_TITLES[index] ?? `Day ${index + 1}`,
      resort,
      note:
        resort.experienceTypes.length > 0
          ? resort.experienceTypes.slice(0, 3).join(" · ")
          : resort.category ?? "Curated stay",
    })),
  };
}

export function ExperiencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const meta = useMemo(() => getResortCatalogMeta(), []);
  const allResorts = useMemo(() => getAllResorts(), []);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [generatedTrip, setGeneratedTrip] = useState<GeneratedTrip | null>(null);

  const resorts = useMemo(
    () =>
      filterResorts({
        query,
        state: stateFilter,
        priceTier: priceFilter,
      }),
    [query, stateFilter, priceFilter],
  );

  const topStates = meta.states.slice(0, 12);

  const generateTrip = () => {
    setGeneratedTrip(
      buildTripPlan(allResorts, {
        query,
        state: stateFilter,
        priceTier: priceFilter,
      }),
    );
  };

  return (
    <Screen className="bg-[#eef2fb]">
      <FlatList
        data={resorts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24 + insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeInDown.duration(400)}>
              <LinearGradient
                colors={["#5B21B6", "#7C3AED", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="mt-2 overflow-hidden rounded-3xl px-5 py-5"
              >
                <View className="flex-row items-start justify-between">
                  <View className="max-w-[82%] gap-1">
                    <Text className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/75">
                      InstaHelp Experiences
                    </Text>
                    <Text className="text-2xl font-extrabold text-white">
                      Resorts & stays
                    </Text>
                    <Text className="text-sm leading-5 text-white/85">
                      {meta.total} curated properties · book via WhatsApp concierge
                    </Text>
                  </View>
                  <View className="rounded-2xl bg-white/15 p-2.5">
                    <Ionicons name="sunny" size={26} color="#ffd500" />
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            <View className="mt-4 flex-row items-center rounded-2xl border border-white bg-white px-3 py-2.5 shadow-sm">
              <Ionicons name="search" size={20} color={ACCENT} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search resort, location, experience…"
                placeholderTextColor="#9ca3af"
                className="ml-2 flex-1 text-[15px] text-neutral-900"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </Pressable>
              ) : null}
            </View>

            <Text className="mb-2 mt-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
              State
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
            >
              <Pressable
                onPress={() => setStateFilter(null)}
                className={`rounded-full px-4 py-2 ${!stateFilter ? "bg-accent" : "border border-neutral-200 bg-white"}`}
              >
                <Text
                  className={`text-[12px] font-bold ${!stateFilter ? "text-white" : "text-neutral-700"}`}
                >
                  All India
                </Text>
              </Pressable>
              {topStates.map(({ state }) => {
                const on = stateFilter === state;
                return (
                  <Pressable
                    key={state}
                    onPress={() => setStateFilter(on ? null : state)}
                    className={`rounded-full px-4 py-2 ${on ? "bg-accent" : "border border-neutral-200 bg-white"}`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${on ? "text-white" : "text-neutral-700"}`}
                    >
                      {state}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text className="mb-2 mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
              Budget
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
            >
              {PRICE_FILTERS.map((p) => {
                const on = priceFilter === p.id;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setPriceFilter(p.id)}
                    className={`rounded-full px-4 py-2 ${on ? "bg-accent-deep" : "border border-neutral-200 bg-white"}`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${on ? "text-white" : "text-neutral-700"}`}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text className="mb-3 mt-5 text-[13px] font-semibold text-neutral-500">
              {resorts.length} {resorts.length === 1 ? "resort" : "resorts"}
              {stateFilter ? ` in ${stateFilter}` : ""}
            </Text>

            <View className="mb-5 overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
              <LinearGradient
                colors={["#111827", "#312e81", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-4"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/65">
                      AI trip generator
                    </Text>
                    <Text className="mt-1 text-xl font-extrabold text-white">
                      Build from all itineraries
                    </Text>
                    <Text className="mt-1 text-[13px] leading-5 text-white/80">
                      Scans the full {allResorts.length}-stay catalog, then adapts the plan
                      to your search and filters.
                    </Text>
                  </View>
                  <View className="rounded-2xl bg-white/15 p-2.5">
                    <Ionicons name="sparkles" size={24} color="#fff" />
                  </View>
                </View>
                <Pressable
                  onPress={generateTrip}
                  accessibilityRole="button"
                  accessibilityLabel="Generate AI trip itinerary"
                  className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 active:opacity-90"
                >
                  <Ionicons name="map" size={18} color={ACCENT} />
                  <Text className="text-[14px] font-extrabold text-accent-deep">
                    Generate itinerary
                  </Text>
                </Pressable>
              </LinearGradient>

              {generatedTrip ? (
                <View className="gap-3 px-4 py-4">
                  <View>
                    <Text className="text-base font-extrabold text-neutral-900">
                      {generatedTrip.title}
                    </Text>
                    <Text className="mt-1 text-[12px] leading-5 text-neutral-500">
                      {generatedTrip.subtitle}
                    </Text>
                    <Text className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                      {generatedTrip.sourceCount} stays considered
                    </Text>
                  </View>
                  {generatedTrip.days.map((day) => (
                    <Pressable
                      key={`${day.day}-${day.resort.id}`}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/experiences/[id]",
                          params: { id: day.resort.id },
                        })
                      }
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 active:opacity-90"
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="h-9 w-9 items-center justify-center rounded-2xl bg-accent-soft">
                          <Text className="text-[12px] font-extrabold text-accent-deep">
                            D{day.day}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-[12px] font-extrabold uppercase tracking-wider text-neutral-400">
                            {day.title}
                          </Text>
                          <Text className="mt-0.5 text-[14px] font-extrabold text-neutral-900">
                            {day.resort.name}
                          </Text>
                          <Text className="mt-0.5 text-[12px] text-neutral-500">
                            {day.resort.location}
                            {day.resort.region ? ` · ${day.resort.region}` : ""} · {day.resort.state}
                          </Text>
                          <Text className="mt-1 text-[12px] font-semibold text-accent-deep">
                            {day.note}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ResortCard
            resort={item}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/experiences/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center rounded-3xl border border-dashed border-neutral-300 bg-white/80 px-6 py-12">
            <Ionicons name="bed-outline" size={36} color="#9ca3af" />
            <Text className="mt-3 text-center text-base font-bold text-neutral-800">
              No resorts match
            </Text>
            <Text className="mt-1 text-center text-sm text-neutral-500">
              Try another state or clear your search.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
