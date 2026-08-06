import { ExperiencesExploreChrome } from "@/components/experiences/ExperiencesExploreChrome";
import { FilterChipRow } from "@/components/experiences/FilterChipRow";
import { HolidayCard } from "@/components/experiences/HolidayCard";
import { ResortCard } from "@/components/experiences/ResortCard";
import { Screen } from "@/components/ui/Screen";
import {
  AUTH_FONT,
  AUTH_GRADIENT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_LIGHT,
} from "@/constants/authPremium";
import { EXP } from "@/constants/experienceTheme";
import {
  useAllResorts,
  useHolidayMeta,
  useHolidayPackages,
  useResortMeta,
  useResorts,
} from "@/hooks/useExperienceCatalog";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useExperienceSyncStatus } from "@/providers/ExperienceSyncProvider";
import type { HolidayPackage } from "@/types/experienceCatalog";
import type { ResortRecord } from "@/types/resortExperience";
import { buildHolidayWhatsAppMessage } from "@/utils/holidayBookingMessage";
import { matchesSearchQuery } from "@/utils/searchMatch";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
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

const HOLIDAY_TIER_FILTERS = [
  { id: null, label: "All tiers" },
  { id: "Luxury", label: "Luxury" },
  { id: "Premium", label: "Premium" },
  { id: "Comfort", label: "Comfort" },
] as const;

type CatalogMode = "resorts" | "holidays";

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
  return matchesSearchQuery(
    [
      resort.name,
      resort.location,
      resort.state,
      resort.region,
      resort.category,
      resort.estimatedPriceLabel,
      resort.priceTier,
      ...resort.experienceTypes,
      ...resort.roomTypes,
    ],
    query,
  );
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
  const { data: profile } = useProfileQuery();
  const resortMeta = useResortMeta();
  const holidayMeta = useHolidayMeta();
  const allResorts = useAllResorts();
  const { isSyncing, fetchFailed } = useExperienceSyncStatus();
  const [mode, setMode] = useState<CatalogMode>("resorts");
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [tripOpen, setTripOpen] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState<GeneratedTrip | null>(null);

  const greeting = useMemo(() => {
    const n = profile?.name?.trim();
    return n ? n.split(" ")[0] : "there";
  }, [profile?.name]);

  const resortFilters = useMemo(
    () => ({
      query,
      state: stateFilter,
      priceTier: priceFilter,
    }),
    [query, stateFilter, priceFilter],
  );
  const holidayFilters = useMemo(
    () => ({
      query,
      country: countryFilter,
      budgetTier: tierFilter,
    }),
    [query, countryFilter, tierFilter],
  );

  const resorts = useResorts(resortFilters);
  const holidays = useHolidayPackages(holidayFilters);
  const topStates = resortMeta.states.slice(0, 12);
  const topCountries = holidayMeta.countries.slice(0, 12);

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

  const countryChips = useMemo(
    () => [
      { id: null, label: "All destinations" },
      ...topCountries.map(({ country, count }) => ({
        id: country,
        label: `${country} (${count})`,
      })),
    ],
    [topCountries],
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

  const enquireHoliday = useCallback((item: HolidayPackage) => {
    openWhatsApp(buildHolidayWhatsAppMessage(item));
  }, []);

  const statusLine = isSyncing
    ? "Syncing catalog…"
    : fetchFailed
      ? "Showing offline catalog"
      : mode === "holidays"
        ? "Curated packages · WhatsApp booking"
        : "Curated properties · WhatsApp booking";

  const listData = mode === "holidays" ? holidays : resorts;
  const hasActiveSearch = query.trim().length > 0;
  const propertyCount =
    mode === "holidays"
      ? hasActiveSearch || countryFilter || tierFilter
        ? holidays.length
        : holidayMeta.total
      : hasActiveSearch || stateFilter || priceFilter
        ? resorts.length
        : resortMeta.total;

  return (
    <Screen surface="white" atmosphere={false} inset={!embedded}>
      <ExperiencesExploreChrome
        greeting={greeting}
        query={query}
        onQueryChange={setQuery}
        statusLine={statusLine}
        propertyCount={propertyCount}
        mode={mode}
      />

      <FlatList
        data={listData as (ResortRecord | HolidayPackage)[]}
        keyExtractor={(item) => `${mode}-${item.id}`}
        contentContainerStyle={{
          paddingBottom:
            (embedded ? 28 : Platform.OS === "ios" ? 160 : 150) + insets.bottom,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filtersBlock}>
            <View style={styles.modeRow}>
              {(
                [
                  { id: "resorts", label: "Resorts", icon: "bed-outline" },
                  {
                    id: "holidays",
                    label: "Holidays",
                    icon: "airplane-outline",
                  },
                ] as const
              ).map((tab) => {
                const active = mode === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => {
                      setMode(tab.id);
                      setQuery("");
                    }}
                    style={[styles.modeChip, active && styles.modeChipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={15}
                      color={active ? "#fff" : AUTH_PRIMARY}
                    />
                    <Text
                      style={[
                        styles.modeChipLabel,
                        {
                          fontFamily: AUTH_FONT.bold,
                          color: active ? "#fff" : AUTH_PRIMARY,
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === "resorts" ? (
              <>
                <FilterChipRow
                  label="Where"
                  chips={stateChips}
                  selected={stateFilter}
                  onSelect={setStateFilter}
                  activeColor={AUTH_PRIMARY}
                />

                <FilterChipRow
                  label="Budget"
                  chips={[...PRICE_FILTERS]}
                  selected={priceFilter}
                  onSelect={setPriceFilter}
                  activeColor={AUTH_PRIMARY}
                />

                <Animated.View
                  entering={FadeInDown.delay(80).duration(360)}
                  style={styles.tripBlock}
                >
                  <LinearGradient
                    colors={[...AUTH_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tripGradient}
                  >
                    <View style={styles.tripHeader}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.tripEyebrow,
                            { fontFamily: AUTH_FONT.semibold },
                          ]}
                        >
                          Trip planner
                        </Text>
                        <Text
                          style={[
                            styles.tripTitle,
                            { fontFamily: AUTH_FONT.bold },
                          ]}
                        >
                          Build a stay itinerary
                        </Text>
                      </View>
                      <Pressable onPress={generateTrip} style={styles.tripButton}>
                        <Ionicons name="sparkles" size={16} color={AUTH_PRIMARY} />
                        <Text
                          style={[
                            styles.tripButtonLabel,
                            { fontFamily: AUTH_FONT.bold },
                          ]}
                        >
                          Generate
                        </Text>
                      </Pressable>
                    </View>

                    {tripOpen && generatedTrip ? (
                      <View style={styles.tripResults}>
                        <Text
                          style={[
                            styles.tripPlanTitle,
                            { fontFamily: AUTH_FONT.bold },
                          ]}
                        >
                          {generatedTrip.title}
                        </Text>
                        <Text
                          style={[
                            styles.tripPlanSubtitle,
                            { fontFamily: AUTH_FONT.regular },
                          ]}
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
                            style={styles.tripDayRow}
                          >
                            <View style={styles.tripDayBadge}>
                              <Text
                                style={[
                                  styles.tripDayBadgeText,
                                  { fontFamily: AUTH_FONT.bold },
                                ]}
                              >
                                D{day.day}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.tripDayLabel,
                                  { fontFamily: AUTH_FONT.semibold },
                                ]}
                              >
                                {day.title}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.tripDayResort,
                                  { fontFamily: AUTH_FONT.bold },
                                ]}
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

                <View style={styles.sectionHeader}>
                  <Text
                    style={[
                      styles.sectionEyebrow,
                      { fontFamily: AUTH_FONT.semibold },
                    ]}
                  >
                    RESORTS
                  </Text>
                  <View style={styles.sectionTitleRow}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { fontFamily: AUTH_FONT.bold },
                      ]}
                    >
                      {resorts.length} {resorts.length === 1 ? "stay" : "stays"}
                      {stateFilter ? ` · ${stateFilter}` : ""}
                      {hasActiveSearch ? " · search" : ""}
                    </Text>
                    <View style={styles.sectionMarkPrimary} />
                    <View style={styles.sectionMarkSecondary} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <FilterChipRow
                  label="Destination"
                  chips={countryChips}
                  selected={countryFilter}
                  onSelect={setCountryFilter}
                  activeColor={AUTH_PRIMARY}
                />

                <FilterChipRow
                  label="Tier"
                  chips={[...HOLIDAY_TIER_FILTERS]}
                  selected={tierFilter}
                  onSelect={setTierFilter}
                  activeColor={AUTH_PRIMARY}
                />

                <View style={styles.sectionHeader}>
                  <Text
                    style={[
                      styles.sectionEyebrow,
                      { fontFamily: AUTH_FONT.semibold },
                    ]}
                  >
                    HOLIDAYS
                  </Text>
                  <View style={styles.sectionTitleRow}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { fontFamily: AUTH_FONT.bold },
                      ]}
                    >
                      {holidays.length}{" "}
                      {holidays.length === 1 ? "package" : "packages"}
                      {countryFilter ? ` · ${countryFilter}` : ""}
                      {hasActiveSearch ? " · search" : ""}
                    </Text>
                    <View style={styles.sectionMarkPrimary} />
                    <View style={styles.sectionMarkSecondary} />
                  </View>
                </View>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            {mode === "holidays" ? (
              <HolidayCard
                item={item as HolidayPackage}
                onPress={() => enquireHoliday(item as HolidayPackage)}
              />
            ) : (
              <ResortCard
                resort={item as ResortRecord}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/experiences/[id]",
                    params: { id: item.id },
                  })
                }
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={mode === "holidays" ? "airplane-outline" : "bed-outline"}
              size={36}
              color="#94A3B8"
            />
            <Text style={[styles.emptyTitle, { fontFamily: AUTH_FONT.bold }]}>
              {mode === "holidays" ? "No packages match" : "No resorts match"}
            </Text>
            <Text style={[styles.emptyCopy, { fontFamily: AUTH_FONT.regular }]}>
              {hasActiveSearch
                ? "Try fewer words, another spelling, or clear search."
                : mode === "holidays"
                  ? "Try another destination or clear your filters."
                  : "Try another state or clear your filters."}
            </Text>
          </View>
        }
        initialNumToRender={8}
        maxToRenderPerBatch={12}
        windowSize={8}
        extraData={`${mode}:${query}:${listData.length}`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filtersBlock: {
    paddingHorizontal: 20,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  modeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AUTH_PRIMARY,
    backgroundColor: "#fff",
    paddingVertical: 11,
  },
  modeChipActive: {
    backgroundColor: AUTH_PRIMARY,
    borderColor: AUTH_PRIMARY,
  },
  modeChipLabel: {
    fontSize: 13,
  },
  tripBlock: {
    marginTop: 18,
    marginBottom: 8,
  },
  tripGradient: {
    borderRadius: 22,
    padding: 16,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  tripEyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  tripTitle: {
    color: "#fff",
    fontSize: 17,
    marginTop: 4,
  },
  tripButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tripButtonLabel: {
    color: AUTH_PRIMARY,
    fontSize: 13,
  },
  tripResults: {
    marginTop: 14,
    gap: 10,
  },
  tripPlanTitle: {
    color: "#fff",
    fontSize: 15,
  },
  tripPlanSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 18,
  },
  tripDayRow: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tripDayBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  tripDayBadgeText: {
    color: "#fff",
    fontSize: 12,
  },
  tripDayLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
  },
  tripDayResort: {
    color: "#fff",
    fontSize: 14,
    marginTop: 2,
  },
  sectionHeader: {
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionEyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: AUTH_PRIMARY,
  },
  sectionTitleRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    letterSpacing: -0.3,
    color: "#111827",
  },
  sectionMarkPrimary: {
    width: 20,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: AUTH_PRIMARY,
  },
  sectionMarkSecondary: {
    width: 10,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: AUTH_PRIMARY_LIGHT,
  },
  cardWrap: {
    paddingHorizontal: 20,
  },
  empty: {
    marginHorizontal: 20,
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: EXP.line,
    backgroundColor: EXP.white,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    color: EXP.ink,
  },
  emptyCopy: {
    marginTop: 6,
    fontSize: 13,
    color: EXP.muted,
    textAlign: "center",
  },
});
