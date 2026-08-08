import { ExploreTabHeader } from "@/components/explore/ExploreTabHeader";
import { HomeCategoryRow } from "@/components/home/HomeCategoryRow";
import { HomeStoreHeroVisual } from "@/components/home/HomeStoreHeroVisual";
import { TourAnchor } from "@/components/onboarding/guided/TourAnchor";
import { AppIcon } from "@/components/ui/AppIcon";
import { CreditsPremiumButton } from "@/components/vendors/CreditsPremiumButton";
import { AUTH_FONT } from "@/constants/authPremium";
import { PERF_MODE } from "@/constants/performance";
import type { ExploreCatalogState } from "@/hooks/useExploreCatalog";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
    useGuidedTourStepId,
    useGuidedTourStore,
} from "@/store/guidedTourStore";
import { useHomeHubStore } from "@/store/homeHubStore";
import { MotiView } from "moti";
import { Pressable, StyleSheet, Text, View } from "react-native";

const Box = PERF_MODE ? View : MotiView;

type Props = {
  greeting: string;
  catalog: ExploreCatalogState;
};

export function HomeExploreChrome({ catalog }: Props) {
  const { colors } = useAppTheme();
  const {
    search,
    setSearch,
    setHistoryOpen,
    credits,
    explorePlanLabel,
    categoryFilter,
    setCategoryFilter,
  } = catalog;

  const openHub = useHomeHubStore((s) => s.open);
  const activeFilterCount = useHomeHubStore((s) => s.activeFilterCount);

  const tourSearchText = useGuidedTourStore((s) => s.tourSearchText);
  const tourStep = useGuidedTourStepId();

  const searchValue =
    tourStep === "search" && tourSearchText.length > 0 ? tourSearchText : search;

  const handleSearchChange = (value: string) => {
    if (tourStep === "search") return;
    setSearch(value);
  };

  const handleCategorySelect = (filter: string | null) => {
    setCategoryFilter(filter);
    if (filter) {
      setSearch(filter);
    } else {
      setSearch("");
    }
  };

  return (
    <View style={styles.shell}>
      <ExploreTabHeader
        variant="glass"
        showTagline
        title="Everything you need, just a tap away."
        subtitle={
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Find trusted vendors for{" "}
            <Text style={[styles.subtitleBold, { color: colors.ink }]}>
              300+ services
            </Text>{" "}
            near you in seconds.
          </Text>
        }
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchTourAnchorId="tour-search"
        searchPlaceholder="Search for services (e.g. Laptop Repair, Cleaning, Wi-Fi,...)"
        searchTypingPlaceholders={[
          "Search cleaning near you...",
          "Search plumber in your area...",
          "Search electrician or AC repair...",
          "Search delivery and errands...",
          "Search by vendor name...",
        ]}
        statSlot={
          <View style={styles.headerActions}>
            <TourAnchor id="tour-credits">
              <CreditsPremiumButton
                credits={credits}
                hint={explorePlanLabel}
                variant="dark"
                onPress={() => setHistoryOpen(true)}
              />
            </TourAnchor>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={({ pressed }) => [
                styles.bellBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.line,
                },
                pressed && styles.bellPressed,
              ]}
            >
              <AppIcon name="bell-outline" size={20} color={colors.ink} />
            </Pressable>
          </View>
        }
        searchTrailing={
          <Pressable
            onPress={openHub}
            accessibilityRole="button"
            accessibilityLabel={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
            hitSlop={8}
            style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.7 }]}
          >
            <AppIcon name="filter" size={20} color={colors.inkMuted} />
            {activeFilterCount > 0 ? (
              <View
                style={[
                  styles.filterDot,
                  {
                    backgroundColor: colors.ink,
                    borderColor: colors.surface,
                  },
                ]}
              />
            ) : null}
          </Pressable>
        }
        heroSlot={
          <Box
            {...(PERF_MODE
              ? { style: styles.heroSlot }
              : {
                  from: { opacity: 0, translateY: 10 },
                  animate: { opacity: 1, translateY: 0 },
                  transition: {
                    type: "spring" as const,
                    damping: 20,
                    stiffness: 280,
                    delay: 120,
                  },
                  style: styles.heroSlot,
                })}
          >
            <HomeStoreHeroVisual />
          </Box>
        }
      />

      <TourAnchor id="tour-categories">
        <HomeCategoryRow
          activeFilter={categoryFilter}
          onSelect={handleCategorySelect}
          onOpenMore={openHub}
        />
      </TourAnchor>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    paddingBottom: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bellPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  filterBtn: {
    position: "relative",
    padding: 4,
  },
  filterDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  heroSlot: {
    marginTop: -4,
    zIndex: 1,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: AUTH_FONT.regular,
  },
  subtitleBold: {
    fontFamily: AUTH_FONT.bold,
  },
});
