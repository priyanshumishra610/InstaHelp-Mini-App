import { GlassTabBarBackground } from "@/components/navigation/GlassTabBarBackground";
import { GlassTabBarButton } from "@/components/navigation/GlassTabBarButton";
import { GlassTabIcon } from "@/components/navigation/GlassTabIcon";
import {
  slideSceneInterpolator,
  slideTransitionSpec,
} from "@/components/navigation/tabSlideTransition";
import { TAB_BAR_BASE_HEIGHT, HomeHubFab } from "@/components/home/HomeHubFab";
import { InAppTutorialOverlay } from "@/components/onboarding/InAppTutorialOverlay";
import { TutorialTarget } from "@/components/onboarding/TutorialTarget";
import { RADIUS } from "@/constants/designSystem";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSmartLocalNotifications } from "@/hooks/useSmartLocalNotifications";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboardingStore } from "@/store/onboardingStore";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import { useTutorialStore } from "@/store/tutorialStore";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Redirect, Tabs, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TutorialTabButton({
  tutorialId,
  ...props
}: BottomTabBarButtonProps & { tutorialId: string }) {
  return (
    <TutorialTarget id={tutorialId} style={{ flex: 1, alignSelf: "stretch" }}>
      <GlassTabBarButton {...props} />
    </TutorialTarget>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
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

  useSmartLocalNotifications(notificationInterests, profileName, notificationPersona);

  const pendingInAppTutorial = useOnboardingStore((s) => s.pendingInAppTutorial);
  const appTutorialCompleted = useOnboardingStore((s) => s.appTutorialCompleted);
  const setPendingInAppTutorial = useOnboardingStore((s) => s.setPendingInAppTutorial);
  const startTutorial = useTutorialStore((s) => s.startTutorial);
  const tutorialActive = useTutorialStore((s) => s.active);

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

  // First install / first home visit: always start the interactive tour once.
  useEffect(() => {
    if (!isReady || !onboardingHydrated) return;
    if (destination !== "/(tabs)") return;
    if (appTutorialCompleted || tutorialActive) return;

    const timer = setTimeout(() => {
      const onboarding = useOnboardingStore.getState();
      if (onboarding.appTutorialCompleted) return;
      if (useTutorialStore.getState().active) return;
      onboarding.setPendingInAppTutorial(false);
      useTutorialStore.getState().startTutorial();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    appTutorialCompleted,
    destination,
    isReady,
    onboardingHydrated,
    pendingInAppTutorial,
    setPendingInAppTutorial,
    startTutorial,
    tutorialActive,
  ]);

  if (!isReady) {
    return null;
  }

  if (destination !== "/(tabs)") {
    return <Redirect href={destination ?? "/(auth)/phone"} />;
  }

  const floatGap = 10;
  const bottomInset = Math.max(insets.bottom, 8) + floatGap;
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + bottomInset;

  return (
    <View className="relative flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: "shift",
          sceneStyleInterpolator: slideSceneInterpolator,
          transitionSpec: slideTransitionSpec,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.inkMuted,
          tabBarBackground: () => <GlassTabBarBackground />,
          tabBarButton: (props) => <GlassTabBarButton {...props} />,
          tabBarStyle: {
            position: "absolute",
            left: 22,
            right: 22,
            bottom: bottomInset,
            height: TAB_BAR_BASE_HEIGHT,
            paddingBottom: 4,
            paddingTop: 4,
            paddingHorizontal: 6,
            borderTopWidth: 0,
            backgroundColor: "transparent",
            borderRadius: RADIUS.pill,
            elevation: 0,
            shadowOpacity: 0,
            overflow: "visible",
          },
          sceneStyle: {
            paddingBottom: tabBarHeight + 10,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            letterSpacing: 0.1,
            marginTop: 1,
          },
          tabBarItemStyle: {
            paddingTop: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon name="home" color={color} focused={focused} size={20} />
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
          listeners={{
            tabPress: () => {
              useTutorialStore.getState().advanceOnTarget("tab-experiences");
            },
          }}
          options={{
            title: "Experiences",
            tabBarButton: (props) => (
              <TutorialTabButton {...props} tutorialId="tab-experiences" />
            ),
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon
                name="experiences"
                color={color}
                focused={focused}
                size={20}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              useTutorialStore.getState().advanceOnTarget("tab-shop");
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
            tabBarButton: (props) => (
              <TutorialTabButton {...props} tutorialId="tab-shop" />
            ),
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon name="shop" color={color} focused={focused} size={20} />
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
          listeners={{
            tabPress: () => {
              useTutorialStore.getState().advanceOnTarget("tab-profile");
            },
          }}
          options={{
            title: "Profile",
            tabBarButton: (props) => (
              <TutorialTabButton {...props} tutorialId="tab-profile" />
            ),
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon name="profile" color={color} focused={focused} size={20} />
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
      <HomeHubFab />
      <InAppTutorialOverlay />
    </View>
  );
}
