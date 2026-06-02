import { useTrendingServices } from "@/hooks/useCategories";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export function TrendingServicesRow() {
  const router = useRouter();
  const { services, loading } = useTrendingServices(10);

  if (!loading && !services.length) return null;

  return (
    <View className="mt-6">
      <View className="mb-3 px-5">
        <Text className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent-muted">
          Trending
        </Text>
        <Text className="mt-1 text-[18px] font-extrabold text-neutral-900">
          Popular services this week
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {loading
          ? [0, 1, 2].map((i) => (
              <View
                key={i}
                className="h-[108px] w-[100px] rounded-2xl bg-neutral-100"
              />
            ))
          : services.map((svc) => (
                <Pressable
                  key={svc.id}
                  onPress={() => {
                    if (svc.formServiceId) {
                      router.push(`/request/${svc.slug}`);
                    } else {
                      router.push({
                        pathname: "/(tabs)/vendors",
                        params: { search: svc.name },
                      });
                    }
                  }}
                  className="w-[100px] items-center rounded-2xl border border-neutral-100 bg-white px-2 py-3 active:opacity-90"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-accent-soft">
                    <Ionicons
                      name={(svc.icon as ComponentProps<typeof Ionicons>["name"]) ?? "construct-outline"}
                      size={22}
                      color="#7C3AED"
                    />
                  </View>
                  <Text
                    className="mt-2 text-center text-[11px] font-bold leading-4 text-neutral-800"
                    numberOfLines={2}
                  >
                    {svc.name}
                  </Text>
                  {svc.popular ? (
                    <View className="mt-1 flex-row items-center gap-0.5">
                      <Ionicons name="flame" size={10} color="#f59e0b" />
                      <Text className="text-[9px] font-bold text-amber-600">
                        Hot
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              ))}
      </ScrollView>
    </View>
  );
}
