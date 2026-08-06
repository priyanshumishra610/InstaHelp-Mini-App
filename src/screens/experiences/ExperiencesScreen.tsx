import { ExperienceHero } from "@/components/experiences/ExperienceHero";
import { ExperienceSearchBar } from "@/components/experiences/ExperienceSearchBar";
import { FilterChipRow } from "@/components/experiences/FilterChipRow";
import { ResortCard } from "@/components/experiences/ResortCard";
import { Screen } from "@/components/ui/Screen";
import { EXP } from "@/constants/experienceTheme";
import {
  useAllResorts,
  useResortMeta,
  useResorts,
} from "@/hooks/useExperienceCatalog";
import { useExperienceSyncStatus } from "@/providers/ExperienceSyncProvider";
import type { ResortRecord } from "@/types/resortExperience";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
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

function scoreResort(
  resort: ResortRecord,
  query: string,
  priceFilter: string | null,
) {
  const rankScore =
    resort.rank != null && resort.rank > 0 ? Math.max(0, 120 - resort.rank) : 10;
  const ratingScore =
    resort.tripadvisorRating != null ? resort.tripadvisorRating * 10 : 0;
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
    narrowed.length >= 3
      ? narrowed
      : resorts.filter((resort) => includesQuery(resort, query));
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
    subtitle: `Built from ${source.length} matching stays in the live catalog.`,
    sourceCount: source.length,
    days: picked.map((resort, index) => ({
      day: index + 1,
      title: TRIP_DAY_TITLES[index] ?? `Day ${index + 1}`,
      resort,
      note:
        resort.experienceTypes.length > 0
          ? resort.experienceTypes.slice(0, 3).join(" · ")
          : (resort.category ?? "Curated stay"),
    })),
  };
}

export function ExperiencesScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const meta = useResortMeta();
  const allResorts = useAllResorts();
  const { isSyncing, fetchFailed } = useExperienceSyncStatus();
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [tripOpen, setTripOpen] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState<GeneratedTrip | null>(null);

  const filters = useMemo(
    () => ({
      query,
      state: stateFilter,
      priceTier: priceFilter,
    }),
    [query, stateFilter, priceFilter],
  );
  const resorts = useResorts(filters);
  const topStates = meta.states.slice(0, 12);

  const stateChips = useMemo(
    () => [
      { id: null, label: "All India" },
      ...topStates.map(({ state, count }) => ({
        id: state,
        label: `${state} (${count})`,
      })),
    ],
    [topStates],
  );

  const generateTrip = () => {
    setTripOpen(true);
    setGeneratedTrip(
      buildTripPlan(allResorts, {
        query,
        state: stateFilter,
        priceTier: priceFilter,
      }),
    );
  };

  const statusNote = isSyncing
    ? "Syncing catalog…"
    : fetchFailed
      ? "Showing offline catalog"
      : `${meta.total} properties live`;

  return (
    <Screen className="bg-[#F4F6FB]" inset={!embedded}>
      <FlatList
        data={resorts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: embedded ? 12 : 8,
          paddingBottom: 28 + insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ExperienceHero
              tone="resorts"
              eyebrow="InstaHelp Experiences"
              title="Resorts"
              subtitle="Handpicked stays across India — book through WhatsApp concierge."
              meta={statusNote}
            />

            <ExperienceSearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search resort, city, or vibe…"
              accent={EXP.resorts.to}
            />

            <FilterChipRow
              label="Where"
              chips={stateChips}
              selected={stateFilter}
              onSelect={setStateFilter}
              activeColor={EXP.resorts.to}
            />

            <FilterChipRow
              label="Budget"
              chips={[...PRICE_FILTERS]}
              selected={priceFilter}
              onSelect={setPriceFilter}
              activeColor={EXP.resorts.mid}
            />

            <Animated.View
              entering={FadeInDown.delay(80).duration(360)}
              style={{ marginTop: 18, marginBottom: 18 }}
            >
              <LinearGradient
                colors={[EXP.resorts.from, EXP.resorts.mid]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 22, padding: 16 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 11,
                        fontWeight: "800",
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                      }}
                    >
                      AI trip planner
                    </Text>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 17,
                        fontWeight: "800",
                        marginTop: 4,
                      }}
                    >
                      Build a stay itinerary
                    </Text>
                  </View>
                  <Pressable
                    onPress={generateTrip}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 14,
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons name="sparkles" size={16} color={EXP.resorts.mid} />
                    <Text
                      style={{
                        color: EXP.resorts.mid,
                        fontSize: 13,
                        fontWeight: "800",
                      }}
                    >
                      Generate
                    </Text>
                  </Pressable>
                </View>

                {tripOpen && generatedTrip ? (
                  <View style={{ marginTop: 14, gap: 10 }}>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: "800",
                      }}
                    >
                      {generatedTrip.title}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        fontSize: 12,
                        lineHeight: 18,
                      }}
                    >
                      {generatedTrip.subtitle}
                    </Text>
                    {generatedTrip.days.map((day) => (
                      <Pressable
                        key={`${day.day}-${day.resort.id}`}
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/experiences/[id]",
                            params: { id: day.resort.id },
                          })
                        }
                        style={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderRadius: 16,
                          padding: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            backgroundColor: "rgba(255,255,255,0.16)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: "800",
                            }}
                          >
                            D{day.day}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.65)",
                              fontSize: 11,
                              fontWeight: "700",
                            }}
                          >
                            {day.title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: "#fff",
                              fontSize: 14,
                              fontWeight: "800",
                              marginTop: 2,
                            }}
                          >
                            {day.resort.name}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="rgba(255,255,255,0.7)"
                        />
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </LinearGradient>
            </Animated.View>

            <Text
              style={{
                marginBottom: 12,
                fontSize: 13,
                fontWeight: "700",
                color: EXP.muted,
              }}
            >
              {resorts.length} {resorts.length === 1 ? "resort" : "resorts"}
              {stateFilter ? ` in ${stateFilter}` : ""}
            </Text>
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
          <View
            style={{
              alignItems: "center",
              borderRadius: 24,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: EXP.line,
              backgroundColor: EXP.white,
              paddingHorizontal: 24,
              paddingVertical: 40,
            }}
          >
            <Ionicons name="bed-outline" size={36} color="#94A3B8" />
            <Text
              style={{
                marginTop: 12,
                fontSize: 16,
                fontWeight: "800",
                color: EXP.ink,
              }}
            >
              No resorts match
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 13,
                color: EXP.muted,
                textAlign: "center",
              }}
            >
              Try another state or clear your search.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
