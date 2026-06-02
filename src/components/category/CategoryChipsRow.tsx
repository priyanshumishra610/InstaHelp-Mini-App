import { useCategories } from "@/hooks/useCategories";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export function CategoryChipsRow() {
  const router = useRouter();
  const { categories, loading } = useCategories();

  if (!loading && !categories.length) return null;

  return (
    <View className="mt-6">
      <View className="mb-3 px-5">
        <Text className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent-muted">
          Categories
        </Text>
        <Text className="mt-1 text-[18px] font-extrabold text-neutral-900">
          Browse by service type
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className="h-10 w-28 rounded-full bg-neutral-100"
              />
            ))
          : categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/vendors",
                    params: { category: cat.name },
                  })
                }
                className="flex-row items-center gap-2 rounded-full border border-accent/15 bg-white px-4 py-2.5 active:opacity-90"
              >
                <Ionicons
                  name={(cat.icon as IoniconName) ?? "grid-outline"}
                  size={16}
                  color="#7C3AED"
                />
                <Text className="text-[12px] font-bold text-neutral-800">
                  {cat.name}
                </Text>
              </Pressable>
            ))}
      </ScrollView>
    </View>
  );
}
