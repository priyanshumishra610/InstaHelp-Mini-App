import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy route — gift cards now live inside the Shop tab. */
export default function GiftCardsRoute() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: "/(tabs)/shop",
        params: { ...params, section: "giftcards" },
      }}
    />
  );
}
