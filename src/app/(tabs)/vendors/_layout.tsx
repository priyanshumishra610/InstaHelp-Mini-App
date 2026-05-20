import { Stack } from "expo-router";

export default function VendorsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#eef2fb" },
        headerTintColor: "#171717",
        headerTitleStyle: { fontWeight: "800", fontSize: 17 },
        contentStyle: { backgroundColor: "#eef2fb" },
      }}
    />
  );
}
