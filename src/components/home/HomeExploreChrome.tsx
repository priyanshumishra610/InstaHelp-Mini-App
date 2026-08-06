import { ExploreTabHeader } from "@/components/explore/ExploreTabHeader";
import { HomeHeroTagline } from "@/components/home/HomeHeroTagline";
import { HomeHeroVisual } from "@/components/home/HomeHeroVisual";
import type { ExploreCatalogState } from "@/hooks/useExploreCatalog";
import { MotiView } from "moti";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  greeting: string;
  catalog: ExploreCatalogState;
};

export function HomeExploreChrome({ greeting, catalog }: Props) {
  const {
    coords,
    explorePlanLabel,
    entitlements,
    search,
    setSearch,
    setHistoryOpen,
    credits,
  } = catalog;

  const contextLine = useMemo(() => {
    if (entitlements.isProPlus) return "Pro+ · unlimited reveals";
    if (entitlements.isPro) return "Pro · weekly reveals active";
    if (coords) return "Sorted by your location";
    return "4,500+ listings across India";
  }, [coords, entitlements.isPro, entitlements.isProPlus]);

  return (
    <View style={styles.shell}>
      <ExploreTabHeader
        variant="glass"
        title="Explore vendors"
        subtitle={`Hi ${greeting} · ${contextLine}`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by service, name, or area"
        searchTypingPlaceholders={[
          "Search cleaning near you...",
          "Search plumber in your area...",
          "Search electrician or AC repair...",
          "Search delivery and errands...",
          "Search by vendor name...",
        ]}
        stat={{
          value: credits,
          label: "Credits",
          hint: explorePlanLabel,
          onPress: () => setHistoryOpen(true),
        }}
        heroSlot={
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 280, delay: 120 }}
            style={styles.heroSlot}
          >
            <HomeHeroVisual />
            <HomeHeroTagline startDelayMs={620} />
          </MotiView>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    paddingBottom: 4,
  },
  heroSlot: {
    marginTop: 4,
    zIndex: 1,
  },
});
