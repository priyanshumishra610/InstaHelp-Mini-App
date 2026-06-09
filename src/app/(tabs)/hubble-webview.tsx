import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy route — gift cards tab now hosts the SDK directly. */
export default function HubbleWebViewRoute() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: "/(tabs)/giftcards", params }} />;
}
