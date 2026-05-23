import { ScrollView, View } from "react-native";

export function VendorRowSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="h-[168px] w-[168px] overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-100"
        />
      ))}
    </ScrollView>
  );
}
