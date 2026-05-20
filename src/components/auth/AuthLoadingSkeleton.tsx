import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { Screen } from "@/components/ui/Screen";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

function ShimmerBlock({ className }: { className?: string }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={style}
      className={`rounded-2xl bg-neutral-200/80 ${className ?? ""}`}
    />
  );
}

export function AuthLoadingSkeleton() {
  return (
    <Screen>
      <AuthBackdrop>
        <View className="flex-1 px-6 pb-10 pt-14">
          <ShimmerBlock className="h-10 w-36" />
          <ShimmerBlock className="mt-10 h-3 w-full" />
          <ShimmerBlock className="mt-10 h-24 w-24 rounded-3xl" />
          <ShimmerBlock className="mt-6 h-10 w-4/5" />
          <ShimmerBlock className="mt-3 h-10 w-3/5" />
          <ShimmerBlock className="mt-8 h-16 w-full" />
          <ShimmerBlock className="mt-3 h-16 w-full" />
          <ShimmerBlock className="mt-auto h-14 w-full rounded-2xl" />
        </View>
      </AuthBackdrop>
    </Screen>
  );
}
