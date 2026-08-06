import { Stack } from "expo-router";

export default function ArcadeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#171717",
        headerTitleStyle: { fontWeight: "800", fontSize: 17 },
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "InstaHelp Play",
          headerShown: false,
        }}
      />
      <Stack.Screen name="grid" options={{ title: "Insta Grid" }} />
      <Stack.Screen name="hangman" options={{ title: "Hangman" }} />
      <Stack.Screen name="whack" options={{ title: "Whack-a-mole" }} />
    </Stack>
  );
}
