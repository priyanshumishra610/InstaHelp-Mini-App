import { VendorsExploreScreen } from "@/screens/vendors/VendorsExploreScreen";
import { Stack } from "expo-router";

export default function VendorsIndexRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Explore" }} />
      <VendorsExploreScreen />
    </>
  );
}
