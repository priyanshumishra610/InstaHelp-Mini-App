import { TAB_BAR_BASE_HEIGHT, WhatsAppFab } from "@/components/support/WhatsAppFab";
import { useAuthStore } from "@/store/authStore";
import { ensureProfile } from "@/store/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const phone = useAuthStore((s) => s.phone);

  useEffect(() => {
    if (phone) ensureProfile(phone);
  }, [phone]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/phone" />;
  }

  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <View className="relative flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#a88a00",
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
