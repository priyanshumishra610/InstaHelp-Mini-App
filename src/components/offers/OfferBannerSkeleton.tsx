import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const CARD_HEIGHT = 156;

export function OfferBannerSkeleton() {
  return (
    <Animated.View entering={FadeIn.duration(280)} className="mt-6">
      <View
        className="overflow-hidden rounded-[22px] bg-neutral-100"
        style={{ height: CARD_HEIGHT }}
      >
        <View className="p-5">
          <View className="h-5 w-24 rounded-full bg-neutral-200/90" />
          <View className="mt-4 h-6 w-[72%] rounded-lg bg-neutral-200/90" />
          <View className="mt-2.5 h-4 w-[58%] rounded-md bg-neutral-200/70" />
          <View className="mt-6 h-9 w-28 rounded-full bg-neutral-200/80" />
        </View>
      </View>
      <View className="mt-3 flex-row items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <View
            key={`offer-skel-dot-${i}`}
            className="h-2 rounded-full bg-neutral-200"
            style={{ width: i === 0 ? 18 : 8 }}
          />
        ))}
      </View>
    </Animated.View>
  );
}
