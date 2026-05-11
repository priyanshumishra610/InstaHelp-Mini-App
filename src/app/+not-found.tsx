import { LogoMark } from "@/components/ui/LogoMark";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center bg-white px-8">
        <LogoMark size="lg" />
        <View className="mt-6 h-12 w-12 items-center justify-center rounded-full bg-accent">
          <Ionicons name="alert-circle" size={24} color="#ffffff" />
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
