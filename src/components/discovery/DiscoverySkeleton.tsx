import { memo } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

function SkeletonBlock({
  className,
  style,
}: {
  className?: string;
  style?: { width: number | `${number}%`; height: number };
}) {
  return (
    <View
      className={`rounded-xl bg-neutral-100 ${className ?? ""}`}
      style={style}
    />
  );
}

function DiscoverySkeletonComponent() {
  return (
    <Animated.View entering={FadeIn.duration(280)} className="mt-8 px-5">
      <SkeletonBlock style={{ width: "72%", height: 22 }} />
      <SkeletonBlock className="mt-2" style={{ width: "55%", height: 14 }} />
      <SkeletonBlock className="mt-6 rounded-[22px]" style={{ width: "100%", height: 156 }} />
      <View className="mt-3 flex-row items-center justify-center gap-2">
        {[18, 8, 8].map((w, i) => (
          <View
            key={`offer-skel-pill-${i}`}
            className="h-2 rounded-full bg-neutral-100"
            style={{ width: w }}
          />
        ))}
      </View>
      <SkeletonBlock className="mt-5" style={{ width: "100%", height: 40 }} />
      <View className="mt-4 flex-row gap-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} style={{ width: 72, height: 28 }} />
        ))}
      </View>
      <View className="mt-6 flex-row flex-wrap" style={{ gap: 8 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ width: "48%" }}>
            <SkeletonBlock style={{ width: "100%", height: 44 }} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export const DiscoverySkeleton = memo(DiscoverySkeletonComponent);
