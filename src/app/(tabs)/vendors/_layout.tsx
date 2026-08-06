import { detailStackScreenOptions } from "@/components/navigation/stackDetailTransition";
import { whiteStackScreenOptions } from "@/components/navigation/whiteStackScreen";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function VendorsStackLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        ...whiteStackScreenOptions,
        headerShown: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: "Explore" }} />
      <Stack.Screen name="plans" options={{ headerShown: false, title: "Plans" }} />
      <Stack.Screen
        name="[vendorId]"
        options={{ title: "Vendor", ...detailStackScreenOptions }}
      />
      <Stack.Screen name="arcade" options={{ headerShown: false }} />
    </Stack>
  );
}
