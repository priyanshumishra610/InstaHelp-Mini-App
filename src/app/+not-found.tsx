import { LogoMark } from "@/components/ui/LogoMark";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <LinearGradient
        colors={["#f0f6ff", "#ffffff", "#fafafa"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <LogoMark size="lg" withWordmark />
          <View className="mt-8 h-16 w-16 items-center justify-center rounded-[22px] bg-accent shadow-lg shadow-accent/25">
            <Ionicons name="map-outline" size={30} color="#ffffff" />
          </View>
          <Text className="mt-6 text-center text-xl font-extrabold text-neutral-900 dark:text-white">
            We could not open that page
          </Text>
          <Text className="mt-2 max-w-[300px] text-center text-[15px] leading-[22px] text-neutral-600">
            The link may be out of date or this screen is not part of this build
            yet.
          </Text>
          <Link
            href="/(tabs)"
            className="mt-8 min-w-[200px] items-center rounded-full bg-neutral-900 px-8 py-4 shadow-sm active:opacity-90"
          >
            <Text className="text-center text-[15px] font-extrabold text-white">
              Back to home
            </Text>
          </Link>
        </View>
      </LinearGradient>
    </>
  );
}
