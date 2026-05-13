import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export function GiftCardsSkeleton() {
  return (
    <Animated.View entering={FadeIn.duration(220)} className="gap-4 px-4 pt-2">
      <View className="h-40 w-full overflow-hidden rounded-3xl bg-accent-soft">
        <LinearGradient
          colors={["#f0f6ff", "#ffffff", "#f0f6ff"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1, opacity: 0.9 }}
        />
      </View>
      <View className="flex-row gap-3">
        <View className="h-24 flex-1 rounded-2xl bg-accent-soft" />
        <View className="h-24 flex-1 rounded-2xl bg-accent-soft" />
      </View>
      <View className="h-16 w-full rounded-2xl bg-accent-soft" />
      <View className="flex-row flex-wrap gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`cat-skel-${i}`} className="h-24 w-[30%] flex-grow rounded-2xl bg-accent-soft" />
        ))}
      </View>
      <View className="h-28 w-full rounded-2xl bg-accent-soft" />
      <View className="h-36 w-full rounded-2xl bg-accent-soft" />
    </Animated.View>
  );
}

export function GiftCardsInlineSkeleton() {
  return (
    <View className="gap-3 px-4">
      <View className="h-3 w-40 rounded-full bg-accent-soft" />
      <View className="h-24 w-full rounded-2xl bg-accent-soft" />
    </View>
  );
}
