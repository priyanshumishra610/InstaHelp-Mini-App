import { EmptyState } from "@/components/ui/EmptyState";
import { GlowButton } from "@/components/ui/GlowButton";
import { HomeExploreChrome } from "@/components/home/HomeExploreChrome";
import { AUTH_FONT, AUTH_PRIMARY, AUTH_ACCENT_YELLOW } from "@/constants/authPremium";
import { ACCENT } from "@/constants/theme";
import { EarlyAccessStrip } from "@/components/vendors/EarlyAccessStrip";
import { MarketplaceVendorCard } from "@/components/vendors/MarketplaceVendorCard";
import { SavedVendorsStrip } from "@/components/vendors/SavedVendorsStrip";
import { VendorExploreListSkeleton } from "@/components/vendors/VendorExploreListSkeleton";
import {
  distanceKmFromUser,
  type ExploreCatalogState,
} from "@/hooks/useExploreCatalog";
import { useRouter } from "expo-router";
import {
  Platform,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  catalog: ExploreCatalogState;
  greeting: string;
};

export function ExploreVendorList({
  catalog,
  greeting,
}: Props) {
  const router = useRouter();
  const {
    coords,
    isVendorUnlocked,
    catalogVendors,
    loading,
    refreshing,
    error,
    refresh,
    retry,
    source,
    revealCostLabel,
    filtered,
    sections,
    handleReveal,
    clearFilters,
    entitlements,
  } = catalog;

  if (loading && !filtered.length && !error) {
    return (
      <View className="flex-1">
        <HomeExploreChrome greeting={greeting} catalog={catalog} />
        <VendorExploreListSkeleton />
      </View>
    );
  }

  if (error && !filtered.length) {
    return (
      <View className="flex-1 justify-center px-6">
        <HomeExploreChrome greeting={greeting} catalog={catalog} />
        <EmptyState
          title="Could not load vendors"
          subtitle={
            source === "firestore"
              ? "Check your connection and Firebase config, then try again."
              : "Something went wrong loading the catalog."
          }
          icon="cloud-offline-outline"
        >
          <GlowButton label="Retry" onPress={retry} variant="primary" />
        </EmptyState>
      </View>
    );
  }

  return (
    <SectionList
      style={{ flex: 1 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={ACCENT}
        />
      }
      ListFooterComponent={<View className="h-8" />}
      ListHeaderComponent={
        <>
          <HomeExploreChrome greeting={greeting} catalog={catalog} />
          <EarlyAccessStrip
            vendors={catalogVendors}
            canAccess={entitlements.canAccessEarlyCategories}
            onReveal={(vendorId) => {
              void handleReveal(vendorId);
            }}
            isVendorUnlocked={isVendorUnlocked}
            distanceKmFromUser={(v) => distanceKmFromUser(v, coords)}
            revealCostLabel={revealCostLabel}
          />
          <SavedVendorsStrip
            vendors={catalogVendors}
            isPro={entitlements.isPro}
            savedLimit={entitlements.savedVendorLimit}
          />
        </>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionEyebrow, { fontFamily: AUTH_FONT.semibold }]}>
            {section.title.toUpperCase()}
          </Text>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { fontFamily: AUTH_FONT.bold }]}>
              {section.data.length} vendor{section.data.length === 1 ? "" : "s"}
            </Text>
            <View style={styles.sectionMarkBlue} />
            <View style={styles.sectionMarkYellow} />
          </View>
        </View>
      )}
      renderItem={({ item, index }) => (
        <MarketplaceVendorCard
          vendor={item}
          index={index}
          distanceKm={distanceKmFromUser(item, coords)}
          unlocked={isVendorUnlocked(item.id)}
          revealCostLabel={revealCostLabel}
          onPressCard={() => router.push(`/(tabs)/vendors/${item.id}`)}
          onReveal={() => {
            void handleReveal(item.id);
          }}
        />
      )}
      ListEmptyComponent={
        <View className="min-h-[280px] justify-center px-5 py-10">
          <EmptyState
            title="Nothing matches quite yet"
            subtitle="Relax a filter or try a simpler search — the catalog spans 4,500+ vendors across India."
            icon="search-outline"
          >
            <GlowButton
              label="Reset everything"
              onPress={clearFilters}
              variant="primary"
            />
          </EmptyState>
        </View>
      }
      contentContainerStyle={{
        paddingBottom: Platform.OS === "ios" ? 160 : 150,
        flexGrow: 1,
      }}
      initialNumToRender={12}
      maxToRenderPerBatch={22}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionEyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: AUTH_PRIMARY,
  },
  sectionTitleRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    letterSpacing: -0.3,
    color: "#111827",
  },
  sectionMarkBlue: {
    width: 20,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: AUTH_PRIMARY,
  },
  sectionMarkYellow: {
    width: 10,
    height: 2.5,
    borderRadius: 99,
    backgroundColor: AUTH_ACCENT_YELLOW,
  },
});
