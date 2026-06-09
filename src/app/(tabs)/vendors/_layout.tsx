import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function VendorsStackLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#eef2fb" },
        headerTintColor: "#171717",
        headerTitleStyle: { fontWeight: "800", fontSize: 17 },
        contentStyle: { backgroundColor: "#eef2fb" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: "Explore" }} />
      <Stack.Screen name="plans" options={{ headerShown: false, title: "Plans" }} />
      <Stack.Screen name="[vendorId]" options={{ title: "Vendor" }} />
      <Stack.Screen name="arcade" options={{ headerShown: false }} />
    </Stack>
  );
}
