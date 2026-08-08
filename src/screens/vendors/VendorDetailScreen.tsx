import {
  BANGALORE_CITY_CENTER,
  VENDOR_REVEAL_CREDIT_COST,
} from "@/constants/vendorMarketplace";
import { Screen } from "@/components/ui/Screen";
import { AppIcon } from "@/components/ui/AppIcon";
import { VendorContactRevealPanel } from "@/components/vendors/VendorContactRevealPanel";
import { MarketplaceToast } from "@/components/vendors/MarketplaceToast";
import { useVendorUserLocation } from "@/hooks/useVendorUserLocation";
import { haversineKm } from "@/services/vendors/vendorGeo";
import { useVendor } from "@/hooks/useVendor";
import {
  formatStartingPrice,
  vendorGallerySources,
  serviceDescriptionPreview,
} from "@/services/vendors/vendorPresentation";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import { SaveVendorButton } from "@/components/vendors/SaveVendorButton";
import { exploreRevealCostLabel, tryExploreReveal } from "@/services/explore/exploreRevealService";
import { alertInsufficientCredits } from "@/services/ads/alertInsufficientCredits";
import { CreditHistoryModal } from "@/components/vendors/CreditHistoryModal";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { COLORS, RADIUS, SPACE, cardShadow } from "@/constants/designSystem";
import { ACCENT, ACCENT_TINT } from "@/constants/theme";
import { tabBarTopOffset } from "@/constants/tabBar";
import type { AppIconKey } from "@/constants/icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageStyle,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function RemoteImage({
  uri,
  style,
  resizeMode = "cover",
}: {
  uri: string;
  style: StyleProp<ImageStyle>;
  resizeMode?: "cover" | "contain" | "stretch";
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <View style={[style, styles.imageFallback]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={[styles.sectionLabel, { fontFamily: AUTH_FONT.semibold }]}>
      {children}
    </Text>
  );
}

function StatChip({
  icon,
  label,
  value,
  accent,
}: {
  icon: AppIconKey;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.statChip, accent && styles.statChipAccent]}>
      <AppIcon name={icon} size={14} color={accent ? ACCENT : COLORS.inkMuted} />
      <View style={styles.statChipText}>
        <Text style={[styles.statChipLabel, { fontFamily: AUTH_FONT.medium }]}>
          {label}
        </Text>
        <Text
          style={[styles.statChipValue, { fontFamily: AUTH_FONT.bold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function ServiceTag({ label }: { label: string }) {
  return (
    <View style={styles.serviceTag}>
      <Text style={[styles.serviceTagText, { fontFamily: AUTH_FONT.medium }]}>
        {label}
      </Text>
    </View>
  );
}

export function VendorDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const phone = useAuthPhone();
  const { subscription, entitlements } = useExploreSubscription();
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();

  const { vendor, loading: vendorLoading, error: vendorError, notFound, retry } =
    useVendor(String(vendorId ?? ""));
  const coords = useVendorUserLocation(true);

  const credits = useVendorLeadStore((s) => s.credits);
  const unlockedVendorIds = useVendorLeadStore((s) => s.unlockedVendorIds);
  const unlocked = vendor ? unlockedVendorIds.includes(vendor.id) : false;

  const [toast, setToast] = useState<string | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = vendor ? vendorDisplayName(vendor) : "Vendor";

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/vendors");
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToastMsg = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2700);
  }, []);

  const handleReveal = useCallback(async () => {
    if (!vendor) return;
    const res = await tryExploreReveal(phone, vendor.id);
    if (!res.ok) {
      if (res.reason === "weekly_limit") {
        Alert.alert(
          "Weekly limit reached",
          "Your Pro plan includes 10 reveals per week. Upgrade to Pro+ for unlimited reveals.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "View plans",
              onPress: () => router.push("/(tabs)/vendors/plans"),
            },
          ],
        );
        return;
      }
      alertInsufficientCredits({
        needCredits: VENDOR_REVEAL_CREDIT_COST,
        onOpenPlans: () => router.push("/(tabs)/vendors/plans"),
        onOpenCredits: () => setCreditsOpen(true),
      });
      return;
    }
    if (!res.alreadyUnlocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToastMsg(
        res.usedCredits
          ? "Contact unlocked — your credits were updated."
          : "Contact unlocked with your Explore plan!",
      );
    }
  }, [vendor, phone, showToastMsg, router]);

  if (vendorLoading) {
    return (
      <Screen surface="white" atmosphere={false} inset={false}>
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <View style={styles.topBarSide}>
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              style={({ pressed }) => [styles.headerBack, pressed && styles.headerBackPressed]}
            >
              <AppIcon name="chevron-left" size={26} color="#171717" />
            </Pressable>
          </View>
          <Text style={[styles.topBarTitle, { fontFamily: AUTH_FONT.semibold }]}>
            Profile
          </Text>
          <View style={styles.topBarSideSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={[styles.loadingText, { fontFamily: AUTH_FONT.regular }]}>
            Loading vendor…
          </Text>
        </View>
      </Screen>
    );
  }

  if (!vendor) {
    return (
      <Screen surface="white" atmosphere={false} inset={false}>
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <View style={styles.topBarSide}>
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              style={({ pressed }) => [styles.headerBack, pressed && styles.headerBackPressed]}
            >
              <AppIcon name="chevron-left" size={26} color="#171717" />
            </Pressable>
          </View>
          <Text style={[styles.topBarTitle, { fontFamily: AUTH_FONT.semibold }]}>
            Not found
          </Text>
          <View style={styles.topBarSideSpacer} />
        </View>
        <View style={[styles.centered, styles.errorWrap]}>
          <View style={styles.errorIcon}>
            <AppIcon name="empty" size={28} color={COLORS.inkMuted} />
          </View>
          <Text style={[styles.errorTitle, { fontFamily: AUTH_FONT.bold }]}>
            Vendor unavailable
          </Text>
          <Text style={[styles.errorBody, { fontFamily: AUTH_FONT.regular }]}>
            {vendorError
              ? "Could not load this vendor. Check your connection and try again."
              : notFound
                ? "This vendor is no longer available."
                : "Invalid vendor link."}
          </Text>
          <View style={styles.errorActions}>
            {vendorError ? (
              <Pressable onPress={retry} style={styles.primaryBtn}>
                <Text style={[styles.primaryBtnText, { fontFamily: AUTH_FONT.semibold }]}>
                  Retry
                </Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => router.back()} style={styles.outlineBtn}>
              <Text style={[styles.outlineBtnText, { fontFamily: AUTH_FONT.semibold }]}>
                Go back
              </Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  const distanceKm =
    vendor.coordinates && (coords ?? BANGALORE_CITY_CENTER)
      ? haversineKm(coords ?? BANGALORE_CITY_CENTER, vendor.coordinates)
      : null;

  const gallery = vendorGallerySources(vendor);
  const showHeroBanner = gallery.length > 1;
  const heroImage = showHeroBanner ? gallery[0] : null;
  const avatarUri =
    vendor.profileImageUrl?.startsWith("http") ? vendor.profileImageUrl : gallery[0] ?? null;
  const galleryRest = (showHeroBanner ? gallery.slice(1) : gallery).filter(
    (uri) => !avatarUri || uri !== avatarUri,
  );

  const serviceTags = [vendor.subCategory.trim()].filter(Boolean);

  const servicesText = vendor.servicesText.trim();
  const serviceLines = servicesText
    ? servicesText
        .split(/[\n,;]+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : vendor.subCategory.trim()
      ? [vendor.subCategory.trim()]
      : [];

  const revealCostLabel = exploreRevealCostLabel(subscription);
  const usesPlanReveal = entitlements.hasPlanReveals;

  const tabBarClearance = tabBarTopOffset(insets.bottom);
  const footerHeightEstimate = unlocked ? 68 : 120;
  const scrollBottomPad = tabBarClearance + footerHeightEstimate + 20;

  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ratingLabel = vendor.rating > 0 ? vendor.rating.toFixed(1) : "New";
  const reviewLabel =
    vendor.reviewCount > 0
      ? vendor.reviewCount.toLocaleString("en-IN")
      : "—";

  return (
    <Screen surface="white" atmosphere={false} inset={false}>
      <View style={styles.root}>
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <View style={styles.topBarSide}>
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              style={({ pressed }) => [styles.headerBack, pressed && styles.headerBackPressed]}
            >
              <AppIcon name="chevron-left" size={26} color="#171717" />
            </Pressable>
          </View>
          <Text style={[styles.topBarTitle, { fontFamily: AUTH_FONT.semibold }]}>
            Profile
          </Text>
          <Pressable
            onPress={() => setCreditsOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open credits"
            style={styles.creditsPill}
          >
            <Text style={[styles.creditsLabel, { fontFamily: AUTH_FONT.medium }]}>
              Credits
            </Text>
            <Text style={[styles.creditsValue, { fontFamily: AUTH_FONT.bold }]}>
              {credits}
            </Text>
          </Pressable>
        </View>

        {toast ? <MarketplaceToast message={toast} key={toast} /> : null}
        <CreditHistoryModal
          visible={creditsOpen}
          onClose={() => setCreditsOpen(false)}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPad },
          ]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
        >
          <View style={styles.profileSection}>
            <View style={[styles.heroCard, cardShadow("card")]}>
              <View style={styles.heroTop}>
                {avatarUri ? (
                  <RemoteImage uri={avatarUri} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={[styles.avatarText, { fontFamily: AUTH_FONT.bold }]}>
                      {initials || "IH"}
                    </Text>
                  </View>
                )}

                <View style={styles.heroBody}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[styles.vendorName, { fontFamily: AUTH_FONT.bold }]}
                      numberOfLines={3}
                    >
                      {title}
                    </Text>
                    <SaveVendorButton vendorId={vendor.id} size={18} />
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.categoryPill}>
                      <Text style={[styles.categoryText, { fontFamily: AUTH_FONT.semibold }]}>
                        {vendor.category}
                      </Text>
                    </View>
                    {vendor.isVerified ? (
                      <View style={styles.verifiedPill}>
                        <AppIcon name="shield" size={11} color={COLORS.success} />
                        <Text style={[styles.verifiedText, { fontFamily: AUTH_FONT.semibold }]}>
                          Verified
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.locationRow}>
                    <AppIcon name="location" size={13} color={COLORS.inkSubtle} />
                    <Text style={[styles.locationText, { fontFamily: AUTH_FONT.regular }]}>
                      {vendor.areaLabel}
                      {vendor.city ? `, ${vendor.city}` : ""}
                    </Text>
                    {distanceKm != null ? (
                      <Text style={[styles.distanceText, { fontFamily: AUTH_FONT.semibold }]}>
                        {distanceKm.toFixed(1)} km
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>

            {heroImage ? (
              <View style={styles.heroImageWrap}>
                <RemoteImage uri={heroImage} style={styles.heroImage} />
                <View style={styles.heroImageFade} />
              </View>
            ) : null}
          </View>

            <View style={styles.statsRow}>
              <StatChip icon="star" label="Rating" value={ratingLabel} accent />
              <StatChip icon="briefcase" label="Starting" value={formatStartingPrice(vendor)} />
              <StatChip icon="chat" label="Reviews" value={reviewLabel} />
            </View>

            {galleryRest.length > 0 ? (
              <>
                <SectionLabel>Gallery</SectionLabel>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryRow}
                >
                  {galleryRest.map((uri, idx) => (
                    <RemoteImage
                      key={`${uri}-${idx}`}
                      uri={uri}
                      style={styles.galleryThumb}
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}

            <SectionLabel>About</SectionLabel>
            <View style={[styles.aboutCard, cardShadow("card")]}>
              <Text style={[styles.aboutText, { fontFamily: AUTH_FONT.regular }]}>
                {serviceDescriptionPreview(vendor, 460)}
              </Text>

              {serviceTags.length > 0 ? (
                <View style={styles.tagRow}>
                  {serviceTags.map((tag) => (
                    <ServiceTag key={tag} label={tag} />
                  ))}
                </View>
              ) : null}

              {serviceLines.length > 0 ? (
                <View style={styles.servicesBlock}>
                  <Text style={[styles.servicesHeading, { fontFamily: AUTH_FONT.semibold }]}>
                    Services offered
                  </Text>
                  {serviceLines.map((line, i) => (
                    <View key={`${i}-${line.slice(0, 24)}`} style={styles.serviceLine}>
                      <View style={styles.serviceBullet} />
                      <Text style={[styles.serviceLineText, { fontFamily: AUTH_FONT.regular }]}>
                        {line}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {unlocked ? (
              <>
                <SectionLabel>Contact details</SectionLabel>
                <VendorContactRevealPanel
                  vendor={vendor}
                  unlocked
                  revealCostLabel={revealCostLabel}
                  usesPlanReveal={usesPlanReveal}
                  onReveal={handleReveal}
                  mode="card"
                />
              </>
            ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: tabBarClearance + 10 },
            cardShadow("lg"),
          ]}
        >
          <VendorContactRevealPanel
            vendor={vendor}
            unlocked={unlocked}
            revealCostLabel={revealCostLabel}
            usesPlanReveal={usesPlanReveal}
            onReveal={handleReveal}
            mode="footer"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACE.md,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACE.md,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(23,23,23,0.08)",
    zIndex: 10,
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  topBarSideSpacer: {
    width: 88,
  },
  topBarSide: {
    width: 88,
    alignItems: "flex-start",
  },
  profileSection: {
    gap: 14,
    marginBottom: 4,
  },
  headerBack: {
    marginLeft: 4,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  headerBackPressed: {
    opacity: 0.65,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.inkMuted,
  },
  errorWrap: {
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.lineLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    color: COLORS.ink,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.inkMuted,
    textAlign: "center",
  },
  errorActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  primaryBtn: {
    borderRadius: RADIUS.md,
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  outlineBtn: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.12)",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  outlineBtnText: {
    fontSize: 14,
    color: COLORS.ink,
  },
  creditsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 88,
    justifyContent: "flex-end",
    borderRadius: 999,
    backgroundColor: COLORS.lineLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  creditsLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  creditsValue: {
    fontSize: 13,
    color: COLORS.ink,
    fontVariant: ["tabular-nums"],
  },
  heroImageWrap: {
    marginHorizontal: -SPACE.md,
    marginTop: 0,
    height: 160,
    overflow: "hidden",
    borderRadius: RADIUS.lg,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.line,
  },
  heroImageFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,25,23,0.18)",
  },
  heroCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.08)",
    padding: SPACE.md,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.line,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarText: {
    fontSize: 22,
    color: AUTH_PRIMARY,
  },
  heroBody: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  vendorName: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 20,
    lineHeight: 26,
    color: COLORS.ink,
    letterSpacing: -0.35,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  categoryPill: {
    borderRadius: 999,
    backgroundColor: COLORS.lineLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.inkMuted,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: COLORS.success,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.inkMuted,
  },
  distanceText: {
    fontSize: 12,
    color: ACCENT,
    fontVariant: ["tabular-nums"],
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: SPACE.md,
  },
  statChip: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.lineLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  statChipAccent: {
    backgroundColor: ACCENT_TINT,
    borderColor: "rgba(23,23,23,0.08)",
  },
  statChipText: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  statChipLabel: {
    fontSize: 10,
    color: COLORS.inkSubtle,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statChipValue: {
    fontSize: 13,
    color: COLORS.ink,
    letterSpacing: -0.15,
  },
  sectionLabel: {
    marginTop: SPACE.lg,
    marginBottom: 10,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORS.inkSubtle,
  },
  galleryRow: {
    gap: 10,
    paddingRight: 4,
  },
  galleryThumb: {
    width: 132,
    height: 96,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.line,
  },
  imageFallback: {
    backgroundColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.08)",
    padding: SPACE.md,
    gap: 14,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.inkMuted,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceTag: {
    borderRadius: 999,
    backgroundColor: ACCENT_TINT,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  serviceTagText: {
    fontSize: 12,
    color: ACCENT,
  },
  servicesBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(23,23,23,0.08)",
    paddingTop: 14,
    gap: 10,
  },
  servicesHeading: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLORS.inkSubtle,
  },
  serviceLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
    marginTop: 7,
  },
  serviceLineText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.ink,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(23,23,23,0.08)",
    paddingHorizontal: SPACE.md,
    paddingTop: 12,
  },
});
