import { Platform, View } from "react-native";

export function VendorExploreListSkeleton() {
  const cardOuter =
    Platform.OS === "ios"
      ? {
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.07,
          shadowRadius: 16,
        }
      : { elevation: 4 };

  return (
    <View className="gap-4 px-4 pt-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={`sk-${i}`}
          className="overflow-hidden rounded-none border border-neutral-200 bg-white p-4"
          style={cardOuter}
        >
          <View className="flex-row gap-3">
            <View className="h-16 w-16 rounded-2xl bg-neutral-200" />
            <View className="flex-1 gap-2 pt-1">
              <View className="h-4 w-[72%] rounded-full bg-neutral-200" />
              <View className="h-3 w-[42%] rounded-full bg-neutral-100" />
              <View className="mt-1 h-3 w-[92%] rounded-full bg-neutral-100" />
              <View className="h-3 w-[54%] rounded-full bg-neutral-100" />
              <View className="mt-3 h-11 w-full rounded-[14px] bg-neutral-100" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
