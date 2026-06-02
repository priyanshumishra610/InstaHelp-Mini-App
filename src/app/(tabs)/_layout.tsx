import { TAB_BAR_BASE_HEIGHT, WhatsAppFab } from "@/components/support/WhatsAppFab";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useSmartLocalNotifications } from "@/hooks/useSmartLocalNotifications";
import { useAuth } from "@/providers/AuthProvider";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
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

  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <View className="relative flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#004aad",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            borderTopColor: "#ececec",
            backgroundColor: "#ffffff",
            height: TAB_BAR_BASE_HEIGHT + bottomInset,
            paddingBottom: bottomInset,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vendors"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                color={color}
                size={size}
              />
            ),
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
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "compass" : "compass-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: "Shop",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "bag" : "bag-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="giftcards"
          options={{
            title: "GiftCards",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "gift" : "gift-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={color}
                size={size}
              />
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
      <WhatsAppFab />
    </View>
  );
}
