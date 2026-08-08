import { AppIcon } from "@/components/ui/AppIcon";
import {
  DISCOVERY_CATEGORIES,
} from "@/constants/discoveryCategories";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { COLORS, RADIUS, cardShadow } from "@/constants/designSystem";
import type { DiscoveryService } from "@/types/discovery";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GRADIENTS: [string, string][] = [
  ["#E7E5E4", "#D6D3D1"],
  ["#F5F5F4", "#E7E5E4"],
  ["#D6D3D1", "#A8A29E"],
  ["#EEECE7", "#E7E5E4"],
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "home-personal": "home-outline",
  education: "school-outline",
  "real-estate": "key-outline",
  "personal-care": "heart-outline",
  manufacturers: "cube-outline",
  business: "briefcase-outline",
  "tech-creative": "laptop-outline",
  "events-travel": "airplane-outline",
  "anything-else": "sparkles-outline",
};

type FlatService = DiscoveryService & {
  categoryId: string;
  categoryTitle: string;
};

export function PopularServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const allServices = useMemo<FlatService[]>(
    () =>
      DISCOVERY_CATEGORIES.flatMap((category) =>
        category.services.map((service) => ({
          ...service,
          categoryId: category.id,
          categoryTitle: category.title,
        })),
      ),
    [],
  );

  const services = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allServices.filter((service) => {
      if (activeCategoryId && service.categoryId !== activeCategoryId) return false;
      if (!q) return true;
      return (
        service.label.toLowerCase().includes(q) ||
        service.categoryTitle.toLowerCase().includes(q)
      );
    });
  }, [activeCategoryId, allServices, query]);

  const openService = (service: DiscoveryService) => {
    router.push({
      pathname: "/(tabs)",
      params: { search: service.label },
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <AppIcon name="chevron-left" size={22} color={AUTH_PRIMARY} />
        </Pressable>
        <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
          All services
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <AppIcon name="search" size={18} color="#78716C" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search services..."
          placeholderTextColor="#A8A29E"
          style={[styles.searchInput, { fontFamily: AUTH_FONT.medium }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search all services"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        <FilterChip
          label="All"
          icon="apps-outline"
          active={activeCategoryId == null}
          onPress={() => setActiveCategoryId(null)}
        />
        {DISCOVERY_CATEGORIES.map((category) => (
          <FilterChip
            key={category.id}
            label={shortLabel(category.title)}
            icon={CATEGORY_ICONS[category.id] ?? "grid-outline"}
            active={activeCategoryId === category.id}
            onPress={() => setActiveCategoryId(category.id)}
          />
        ))}
      </ScrollView>

      <Text style={[styles.countText, { fontFamily: AUTH_FONT.medium }]}>
        {services.length} services
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 28,
        }}
      >
        {services.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { fontFamily: AUTH_FONT.semibold }]}>
              No services found
            </Text>
            <Pressable
              onPress={() => {
                setQuery("");
                setActiveCategoryId(null);
              }}
              style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
            >
              <Text style={[styles.resetText, { fontFamily: AUTH_FONT.semibold }]}>
                Clear filters
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                gradient={GRADIENTS[index % GRADIENTS.length]}
                onPress={openService}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function shortLabel(title: string) {
  return title
    .replace("Home & Personal Services", "Home")
    .replace("Education & Tutoring", "Education")
    .replace("Personal Care & Wellness", "Wellness")
    .replace("Manufacturers & Suppliers", "Suppliers")
    .replace("Business & Professional", "Business")
    .replace("Tech & Creative", "Tech")
    .replace("Events & Travel", "Events")
    .replace("Anything Else", "More");
}

function FilterChip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.filterChip, pressed && styles.pressed]}
    >
      <View style={[styles.filterIcon, active && styles.filterIconActive]}>
        <Ionicons name={icon} size={18} color={active ? "#FFFFFF" : AUTH_PRIMARY} />
      </View>
      <Text
        style={[
          styles.filterLabel,
          { fontFamily: active ? AUTH_FONT.semibold : AUTH_FONT.medium },
          active && styles.filterLabelActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ServiceCard({
  service,
  gradient,
  onPress,
}: {
  service: FlatService;
  gradient: [string, string];
  onPress: (service: DiscoveryService) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(service)}
      accessibilityRole="button"
      accessibilityLabel={service.label}
      style={({ pressed }) => [
        styles.card,
        cardShadow("card"),
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imageWrap}
      >
        <View style={styles.iconChip}>
          <Ionicons name={service.icon} size={18} color={AUTH_PRIMARY} />
        </View>
      </LinearGradient>

      <View style={styles.meta}>
        <Text
          style={[styles.serviceName, { fontFamily: AUTH_FONT.bold }]}
          numberOfLines={1}
        >
          {service.label}
        </Text>
        <Text
          style={[styles.categoryLabel, { fontFamily: AUTH_FONT.medium }]}
          numberOfLines={1}
        >
          {shortLabel(service.categoryTitle)}
        </Text>
        {service.popular ? (
          <View style={styles.ratingRow}>
            <AppIcon name="star" size={11} color={AUTH_PRIMARY} filled />
            <Text style={[styles.popularText, { fontFamily: AUTH_FONT.semibold }]}>
              Popular
            </Text>
          </View>
        ) : (
          <Text style={[styles.tapHint, { fontFamily: AUTH_FONT.regular }]}>
            Tap to explore
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const FILTER_ICON = 48;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.4,
    color: AUTH_PRIMARY,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AUTH_PRIMARY,
    padding: 0,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 2,
  },
  filterChip: {
    width: FILTER_ICON,
    alignItems: "center",
    gap: 6,
  },
  filterIcon: {
    width: FILTER_ICON,
    height: FILTER_ICON,
    borderRadius: RADIUS.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow("sm"),
  },
  filterIconActive: {
    backgroundColor: AUTH_PRIMARY,
    borderColor: AUTH_PRIMARY,
  },
  filterLabel: {
    fontSize: 11,
    color: "#57534E",
    textAlign: "center",
  },
  filterLabelActive: {
    color: AUTH_PRIMARY,
  },
  countText: {
    marginHorizontal: 18,
    marginBottom: 10,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47.5%",
    flexGrow: 1,
    borderRadius: RADIUS.xl,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    overflow: "hidden",
  },
  imageWrap: {
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(231,229,228,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 3,
  },
  serviceName: {
    fontSize: 14,
    letterSpacing: -0.2,
    color: AUTH_PRIMARY,
  },
  categoryLabel: {
    fontSize: 11,
    color: "#78716C",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  popularText: {
    fontSize: 12,
    color: AUTH_PRIMARY,
  },
  tapHint: {
    marginTop: 2,
    fontSize: 11,
    color: "#A8A29E",
  },
  empty: {
    marginTop: 48,
    alignItems: "center",
    gap: 14,
  },
  emptyTitle: {
    fontSize: 15,
    color: AUTH_PRIMARY,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: AUTH_PRIMARY,
  },
  resetText: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
