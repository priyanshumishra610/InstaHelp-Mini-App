import { TAB_BAR_BASE_HEIGHT, WhatsAppFab } from "@/components/support/WhatsAppFab";
import { useSmartLocalNotifications } from "@/hooks/useSmartLocalNotifications";
import { useAuthStore } from "@/store/authStore";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const phone = useAuthStore((s) => s.phone);
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

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/phone" />;
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
          name="bookings"
          options={{
            title: "Activity",
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? "time" : "time-outline"}
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
      </Tabs>
      <WhatsAppFab />
    </View>
  );
}
