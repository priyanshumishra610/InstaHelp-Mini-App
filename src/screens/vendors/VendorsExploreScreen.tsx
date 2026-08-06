import { HomeHubSheet } from "@/components/home/HomeHubSheet";
import { ExploreVendorList } from "@/components/vendors/ExploreVendorList";
import { MarketplaceToast } from "@/components/vendors/MarketplaceToast";
import { CreditHistoryModal } from "@/components/vendors/CreditHistoryModal";
import { Screen } from "@/components/ui/Screen";
import { useExploreCatalog } from "@/hooks/useExploreCatalog";
import { useHomeHubStore } from "@/store/homeHubStore";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

/** Legacy explore route — same merged catalog UI as Home. */
export function VendorsExploreScreen() {
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const searchParam = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const categoryParam = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  const catalog = useExploreCatalog({
    search: searchParam,
    category: categoryParam,
  });

  const hubVisible = useHomeHubStore((s) => s.visible);
  const closeHub = useHomeHubStore((s) => s.close);
  const setActiveFilterCount = useHomeHubStore((s) => s.setActiveFilterCount);

  useEffect(() => {
    setActiveFilterCount(catalog.activeFilterCount);
  }, [catalog.activeFilterCount, setActiveFilterCount]);

  return (
    <Screen atmosphere="hero">
      <View className="flex-1">
        {catalog.toast ? (
          <MarketplaceToast message={catalog.toast} key={catalog.toast} />
        ) : null}
        <CreditHistoryModal
          visible={catalog.historyOpen}
          onClose={() => catalog.setHistoryOpen(false)}
        />
        <HomeHubSheet
          visible={hubVisible}
          onClose={closeHub}
          catalog={catalog}
          onOpenConcierge={closeHub}
        />
        <ExploreVendorList catalog={catalog} greeting="there" />
      </View>
    </Screen>
  );
}
