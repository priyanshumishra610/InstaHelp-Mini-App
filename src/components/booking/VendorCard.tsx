import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export type Vendor = {
  name: string;
  initials: string;
  role: string;
  rating: number;
  jobs: number;
  color: string;
};

const VENDORS: Vendor[] = [
  {
    name: "Rohit Sharma",
    initials: "RS",
    role: "Senior pro",
    rating: 4.9,
    jobs: 312,
    color: "#7c3aed",
  },
  {
    name: "Anita Patel",
    initials: "AP",
    role: "Verified pro",
    rating: 4.8,
    jobs: 178,
    color: "#059669",
  },
  {
    name: "Vikram Singh",
    initials: "VS",
    role: "Top rated",
    rating: 5.0,
    jobs: 421,
    color: "#dc2626",
  },
  {
    name: "Priya Verma",
    initials: "PV",
    role: "Trusted pro",
    rating: 4.7,
    jobs: 92,
    color: "#ea580c",
  },
  {
    name: "Arjun Mehta",
    initials: "AM",
    role: "Senior pro",
    rating: 4.9,
    jobs: 256,
    color: "#0891b2",
  },
  {
    name: "Sneha Kapoor",
    initials: "SK",
    role: "Verified pro",
    rating: 4.8,
    jobs: 145,
    color: "#be185d",
  },
];

export function vendorForId(id: string): Vendor {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return VENDORS[h % VENDORS.length];
}

type Props = {
  vendor: Vendor;
  onCall?: () => void;
  onMessage?: () => void;
  caption?: string;
};

export function VendorCard({ vendor, onCall, onMessage, caption }: Props) {
  return (
    <View className="rounded-3xl border border-brand-line bg-white p-5">
      <View className="flex-row items-center gap-4">
        <View
          style={{ backgroundColor: vendor.color }}
          className="h-14 w-14 items-center justify-center rounded-full"
        >
          <Text className="text-lg font-extrabold text-white">
            {vendor.initials}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-extrabold text-neutral-900"
            numberOfLines={1}
          >
            {vendor.name}
          </Text>
          <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
            {vendor.role}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={12} color="#ffd500" />
              <Text className="text-xs font-bold text-neutral-700">
                {vendor.rating.toFixed(1)}
              </Text>
            </View>
            <View className="h-1 w-1 rounded-full bg-neutral-300" />
            <Text className="text-xs font-medium text-neutral-500">
              {vendor.jobs} jobs
            </Text>
            <View className="h-1 w-1 rounded-full bg-neutral-300" />
            <View className="flex-row items-center gap-1">
              <Ionicons name="shield-checkmark" size={12} color="#059669" />
              <Text className="text-xs font-bold text-emerald-700">
                Verified
              </Text>
            </View>
          </View>
        </View>
      </View>

      {caption ? (
        <View className="mt-4 rounded-2xl bg-accent/10 p-3">
          <Text className="text-xs font-medium leading-5 text-accent-deep">
            {caption}
          </Text>
        </View>
      ) : null}

      {onCall || onMessage ? (
        <View className="mt-4 flex-row gap-2">
          {onCall ? (
            <Pressable
              onPress={onCall}
              accessibilityRole="button"
              accessibilityLabel="Call pro"
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-accent py-3 active:opacity-90"
            >
              <Ionicons name="call" size={16} color="#1a1a1a" />
              <Text className="text-sm font-bold text-accent-foreground">
                Call
              </Text>
            </Pressable>
          ) : null}
          {onMessage ? (
            <Pressable
              onPress={onMessage}
              accessibilityRole="button"
              accessibilityLabel="Message pro"
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-brand-line bg-white py-3 active:bg-accent/5"
            >
              <Ionicons name="chatbubble-ellipses" size={16} color="#a88a00" />
              <Text className="text-sm font-bold text-neutral-800">
                Message
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
