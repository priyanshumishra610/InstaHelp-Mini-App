import { HomeHubSheet } from "@/components/home/HomeHubSheet";
import { Screen } from "@/components/ui/Screen";
import { CreditHistoryModal } from "@/components/vendors/CreditHistoryModal";
import { ExploreVendorList } from "@/components/vendors/ExploreVendorList";
import { MarketplaceToast } from "@/components/vendors/MarketplaceToast";
import { useExploreCatalog } from "@/hooks/useExploreCatalog";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useHomeHubStore } from "@/store/homeHubStore";
import { useRequestFormStore } from "@/store/requestFormStore";
import type { ExploreFormSuggestion } from "@/services/vendors/matchFormToExplore";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";

export function HomeScreen() {
  const params = useLocalSearchParams<{
    service?: string;
    source?: string;
    search?: string;
    category?: string;
  }>();

  const searchParam = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const categoryParam = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const serviceParam = Array.isArray(params.service)
    ? params.service[0]
    : params.service;
  const sourceParam = Array.isArray(params.source)
    ? params.source[0]
    : params.source;

  const catalog = useExploreCatalog({
    search: searchParam,
    category: categoryParam,
  });
  const { data: profile } = useProfileQuery();

  const hubVisible = useHomeHubStore((s) => s.visible);
  const closeHub = useHomeHubStore((s) => s.close);
  const setActiveFilterCount = useHomeHubStore((s) => s.setActiveFilterCount);
  const openForm = useRequestFormStore((s) => s.open);

  useEffect(() => {
    setActiveFilterCount(catalog.activeFilterCount);
  }, [catalog.activeFilterCount, setActiveFilterCount]);

  useEffect(() => {
    if (serviceParam || sourceParam) {
      openForm({ service: serviceParam, source: sourceParam });
    }
  }, [serviceParam, sourceParam, openForm]);

  const greeting = useMemo(() => {
    const n = profile?.name?.trim();
    return n ? n.split(" ")[0] : "there";
  }, [profile?.name]);

  const handleBrowseExploreSuggestion = useCallback(
    (suggestion: ExploreFormSuggestion) => {
      catalog.setSearch(suggestion.search);
    },
    [catalog],
  );

  const openConciergeFromHub = useCallback(() => {
    openForm();
  }, [openForm]);

  return (
    <Screen surface="white" atmosphere={false}>
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
          onOpenConcierge={openConciergeFromHub}
        />

        <ExploreVendorList catalog={catalog} greeting={greeting} />
      </View>
    </Screen>
  );
}
