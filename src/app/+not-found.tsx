import { LogoMark } from "@/components/ui/LogoMark";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center bg-[#FAFAF7] px-8 dark:bg-[#0B0B0C]">
        <LogoMark size="lg" />
        <View className="mt-6 h-12 w-12 items-center justify-center rounded-full bg-accent/20">
          <Ionicons name="alert-circle" size={24} color="#a88a00" />
        </View>
        <Text className="mt-4 text-lg font-extrabold text-neutral-900 dark:text-white">
          This screen does not exist
        </Text>
        <Text className="mt-1 text-center text-sm text-neutral-500">
          The link you followed may be broken or the page was removed.
        </Text>
        <Link
          href="/(tabs)"
          className="mt-6 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground"
        >
          Go home
        </Link>
      </View>
    </>
  );
}
