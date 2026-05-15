import { Screen } from "@/components/ui/Screen";
import { View } from "react-native";

export function AuthLoadingSkeleton() {
  return (
    <Screen>
      <View className="flex-1 px-6 pt-16">
        <View className="h-10 w-40 rounded-xl bg-neutral-100" />
        <View className="mt-8 h-12 w-3/4 rounded-2xl bg-neutral-100" />
        <View className="mt-3 h-12 w-2/3 rounded-2xl bg-neutral-100" />
        <View className="mt-10 h-14 w-full rounded-2xl bg-neutral-100" />
        <View className="mt-4 h-14 w-full rounded-2xl bg-neutral-50" />
      </View>
    </Screen>
  );
}
