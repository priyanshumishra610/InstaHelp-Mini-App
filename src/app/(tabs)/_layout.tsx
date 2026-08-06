import { GlassTabBarBackground } from "@/components/navigation/GlassTabBarBackground";
import { GlassTabBarButton } from "@/components/navigation/GlassTabBarButton";
import { GlassTabIcon } from "@/components/navigation/GlassTabIcon";
import {
  slideSceneInterpolator,
  slideTransitionSpec,
} from "@/components/navigation/tabSlideTransition";
import { TAB_BAR_BASE_HEIGHT, HomeHubFab } from "@/components/home/HomeHubFab";
import { COLORS, RADIUS } from "@/constants/designSystem";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useSmartLocalNotifications } from "@/hooks/useSmartLocalNotifications";
import { useAuth } from "@/providers/AuthProvider";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import { Redirect, Tabs, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
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
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.ink,
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
          options={{
            title: "Experiences",
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
          options={{
            title: "Shop",
            tabBarIcon: ({ color, focused }) => (
              <GlassTabIcon name="shop" color={color} focused={focused} size={20} />
            ),
          }}
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
    </View>
  );
}
