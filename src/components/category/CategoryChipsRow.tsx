import { FilterPill } from "@/components/ui/FilterPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useCategories } from "@/hooks/useCategories";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { ScrollView, View } from "react-native";

export function CategoryChipsRow() {
  const router = useRouter();
  const { categories, loading } = useCategories();

  if (!loading && !categories.length) return null;

  return (
    <View className="mt-6">
      <View className="px-5">
        <SectionHeader
          eyebrow="Categories"
          title="Browse by service type"
          delay={0}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingVertical: 4 }}
      >
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <MotiView
                key={i}
                from={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 800, loop: true }}
                className="h-10 w-28 rounded-full bg-neutral-100"
              />
            ))
          : categories.map((cat, index) => (
              <FilterPill
                key={cat.id}
                label={cat.name}
                icon="explore"
                index={index}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)",
                    params: { category: cat.name },
                  })
                }
              />
            ))}
      </ScrollView>
    </View>
  );
}
