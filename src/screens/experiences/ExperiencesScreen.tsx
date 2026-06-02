import { ResortCard } from "@/components/experiences/ResortCard";
import { Screen } from "@/components/ui/Screen";
import { ACCENT } from "@/constants/theme";
import {
  filterResorts,
  getResortCatalogMeta,
} from "@/services/resorts/getResortCatalog";
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

export function ExperiencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const meta = useMemo(() => getResortCatalogMeta(), []);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);

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
                colors={["#003a85", "#004aad", "#3b82f6"]}
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
