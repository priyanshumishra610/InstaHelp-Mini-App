import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { hasBurnedLeadCredits } from "@/utils/vendorLeadEligibility";
import { Redirect, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

export default function EarnGameLayout() {
  const hasBurned = useVendorLeadStore((s) =>
    hasBurnedLeadCredits(s.transactions),
  );
  const alertedRef = useRef(false);

  useEffect(() => {
    if (hasBurned || alertedRef.current) return;
    alertedRef.current = true;
    const t = setTimeout(() => {
      Alert.alert(
        "Spend credits first",
        "Reveal a vendor contact once to unlock the arcade and earn bonus refill credits.",
      );
    }, 400);
    return () => clearTimeout(t);
  }, [hasBurned]);

  if (!hasBurned) {
    return <Redirect href="/(tabs)/vendors" />;
  }

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
