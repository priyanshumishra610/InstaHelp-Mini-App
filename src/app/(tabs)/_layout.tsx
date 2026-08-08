import { FloatingTabBar } from "@/components/navigation/FloatingTabBar";
import { GlassTabIcon } from "@/components/navigation/GlassTabIcon";
import { PostRequestTabButton } from "@/components/navigation/PostRequestTabButton";
import { RequestFormSheet } from "@/components/home/RequestFormSheet";
import { TAB_BAR_ICON_SIZE } from "@/constants/tabBar";
/* TUTORIAL_DISABLED — GuidedTourOverlay: see src/constants/tutorialFeature.ts
import { GuidedTourOverlay } from "@/components/onboarding/guided/GuidedTourOverlay";
*/
import { TUTORIAL_ENABLED } from "@/constants/tutorialFeature";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSmartLocalNotifications } from "@/hooks/useSmartLocalNotifications";
import { useAuth } from "@/providers/AuthProvider";
import {
  useGuidedTourStepId,
  useGuidedTourStore,
} from "@/store/guidedTourStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import { useRequestFormStore } from "@/store/requestFormStore";
import { Redirect, Tabs, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { isReady } = useAuth();
  const phone = useAuthPhone();
  const destination = useAuthDestination();
  const favoriteServiceIds = useProfileStore((s) => s.profile?.favorites);
  const profileName = useProfileStore((s) => s.profile?.name) ?? null;
  const notificationPersona = useProfileStore((s) =>
    s.profile?.role === "business" ? "business" : "consumer",
  );
  const notificationInterests = useMemo(
    () => favoriteServiceIds ?? [],
    [favoriteServiceIds],
  );

  useEffect(() => {
    if (phone) ensureProfile(phone);
  }, [phone]);

  useSmartLocalNotifications(
    notificationInterests,
    profileName,
    notificationPersona,
    3000,
  );

  const pendingInAppTutorial = useOnboardingStore((s) => s.pendingInAppTutorial);
  const appTutorialCompleted = useOnboardingStore((s) => s.appTutorialCompleted);
  const setPendingInAppTutorial = useOnboardingStore((s) => s.setPendingInAppTutorial);
  const startTour = useGuidedTourStore((s) => s.startTour);
  const tourActive = useGuidedTourStore((s) => s.active);
  const tourFormDemoActive = useGuidedTourStore((s) => s.tourFormDemoActive);
  const tourStep = useGuidedTourStepId();
  const formVisible = useRequestFormStore((s) => s.visible);
  const openForm = useRequestFormStore((s) => s.open);
  const closeForm = useRequestFormStore((s) => s.close);
  const initialService = useRequestFormStore((s) => s.initialService);
  const initialSource = useRequestFormStore((s) => s.initialSource);
  const initialDescription = useRequestFormStore((s) => s.initialDescription);

  const [onboardingHydrated, setOnboardingHydrated] = useState(() =>
    useOnboardingStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (useOnboardingStore.persist.hasHydrated()) {
      setOnboardingHydrated(true);
    }
    return useOnboardingStore.persist.onFinishHydration(() => {
      setOnboardingHydrated(true);
    });
  }, []);

  // TUTORIAL_DISABLED — first-run guided tour auto-start (see tutorialFeature.ts)
  useEffect(() => {
    if (!TUTORIAL_ENABLED) return;
    if (!isReady || !onboardingHydrated) return;
    if (destination !== "/(tabs)") return;
    if (appTutorialCompleted || tourActive) return;

    const timer = setTimeout(() => {
      const onboarding = useOnboardingStore.getState();
      if (onboarding.appTutorialCompleted) return;
      if (useGuidedTourStore.getState().active) return;
      onboarding.setPendingInAppTutorial(false);
      useGuidedTourStore.getState().startTour();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    appTutorialCompleted,
    destination,
    isReady,
    onboardingHydrated,
    pendingInAppTutorial,
    setPendingInAppTutorial,
    startTour,
    tourActive,
  ]);

  useEffect(() => {
    if (tourFormDemoActive) {
      openForm();
    }
  }, [tourFormDemoActive, openForm]);

  useEffect(() => {
    if (tourStep !== "request-form" && tourFormDemoActive) {
      closeForm();
    }
  }, [tourStep, tourFormDemoActive, closeForm]);

  if (!isReady) {
    return null;
  }

  if (destination !== "/(tabs)") {
    return <Redirect href={destination ?? "/(auth)/phone"} />;
  }

  return (
    <View className="relative flex-1">
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "none",
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.inkMuted,
          tabBarStyle: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 0,
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: "transparent",
            overflow: "visible",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon name="home" color={color} focused={focused} size={TAB_BAR_ICON_SIZE} />
            ),
          }}
        />
        <Tabs.Screen
          name="vendors"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            // Keep route accessible via navigation, but remove from bottom navbar.
            href: null,
          }}
        />
        <Tabs.Screen
          name="experiences"
          options={{
            title: "Experiences",
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon
                name="experiences"
                color={color}
                focused={focused}
                size={TAB_BAR_ICON_SIZE}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="post-request"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
          options={{
            title: "New request",
            tabBarButton: (props) => <PostRequestTabButton {...props} />,
            tabBarIcon: () => null,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="shop"
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              const shopRoute = navigation
                .getState()
                .routes.find((r) => r.name === "shop");
              const params = shopRoute?.params as Record<string, unknown> | undefined;
              const hasDeepLinkParams = Boolean(
                params?.sdkPath || params?.brandId || params?.category,
              );
              if (hasDeepLinkParams) {
                e.preventDefault();
                router.navigate("/(tabs)/shop");
              }
            },
          })}
          options={{
            title: "Shop",
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon name="shop" color={color} focused={focused} size={TAB_BAR_ICON_SIZE} />
            ),
          }}
        />
        <Tabs.Screen
          name="giftcards"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon name="profile" color={color} focused={focused} size={TAB_BAR_ICON_SIZE} />
            ),
          }}
        />
        {/* Hubble SDK: same tab navigator so bottom bar stays visible */}
        <Tabs.Screen
          name="hubble-webview"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <RequestFormSheet
        visible={formVisible}
        onClose={closeForm}
        initialService={initialService}
        initialSource={initialSource}
        initialDescription={initialDescription}
        onBrowseExplore={(suggestion) => {
          closeForm();
          router.push({
            pathname: "/(tabs)",
            params: { search: suggestion.search },
          });
        }}
        tourDemo={tourFormDemoActive}
      />
      {/* TUTORIAL_DISABLED — <GuidedTourOverlay /> (tutorialFeature.ts) */}
    </View>
  );
}
