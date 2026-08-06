import { Redirect, useLocalSearchParams } from "expo-router";

/** Explore tab merged into Home — forward deep links with params. */
export default function VendorsIndexRoute() {
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const search = Array.isArray(params.search) ? params.search[0] : params.search;
  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  return (
    <Redirect
      href={{
        pathname: "/(tabs)",
        params: {
          ...(search ? { search } : null),
          ...(category ? { category } : null),
        },
      }}
    />
  );
}
