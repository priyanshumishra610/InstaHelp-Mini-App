import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { maskPhoneForDisplay, normalizePhoneDigits } from "@/utils/vendorPhone";
import { dialPhone, emailVendor, openVendorWhatsApp } from "@/utils/vendorContactActions";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type Props = {
  vendor: VendorRecord;
  unlocked: boolean;
  onReveal: () => void;
};

export function VendorContactRevealPanel({ vendor, unlocked, onReveal }: Props) {
  const name = vendorDisplayName(vendor);
  const digits = normalizePhoneDigits(vendor.phone);

  if (unlocked) {
    return (
      <View className="gap-3">
        <View className="rounded-2xl border border-neutral-200 bg-white p-4">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            Phone
          </Text>
          <Text className="mt-1 text-[18px] font-extrabold text-neutral-900">
            {vendor.phone ?? "Not available"}
          </Text>
        </View>
        {vendor.email ? (
          <View className="rounded-2xl border border-neutral-200 bg-white p-4">
            <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Email
            </Text>
            <Text className="mt-1 text-[15px] font-semibold text-accent">
              {vendor.email}
            </Text>
          </View>
        ) : null}
        <View className="rounded-2xl border border-neutral-200 bg-white p-4">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            Address
          </Text>
          <Text className="mt-1 text-[14px] leading-5 text-neutral-800">
            {vendor.address || `${vendor.areaLabel}, Bengaluru`}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => dialPhone(vendor.phone)}
            disabled={!digits}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 active:opacity-90 disabled:opacity-40"
          >
            <Ionicons name="call" size={18} color="#ffffff" />
            <Text className="text-[14px] font-extrabold text-white">Call</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              openVendorWhatsApp(
                vendor.phone,
                `Hi ${name}, I found you on InstaHelp and would like to book a service.`,
              )
            }
            disabled={digits.length < 8}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-accent bg-white py-3.5 active:bg-neutral-50 disabled:opacity-40"
          >
            <Ionicons name="logo-whatsapp" size={18} color="#16a34a" />
            <Text className="text-[14px] font-extrabold text-neutral-900">
              WhatsApp
            </Text>
          </Pressable>
        </View>
        {vendor.email ? (
          <Pressable
            onPress={() =>
              emailVendor(
                vendor.email,
                `Inquiry via InstaHelp — ${name}`,
              )
            }
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 active:bg-neutral-100"
          >
            <Ionicons name="mail-outline" size={18} color="#004aad" />
            <Text className="text-[14px] font-extrabold text-neutral-900">
              Email
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl border border-accent-tint">
      <LinearGradient
        colors={["rgba(0,74,173,0.2)", "rgba(255,255,255,0.08)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 py-6"
      >
        <View className="items-center">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white shadow-soft">
            <Ionicons name="lock-closed" size={28} color="#004aad" />
          </View>
          <Text className="mt-3 text-center text-[18px] font-extrabold text-neutral-900">
            Premium contact access
          </Text>
          <Text className="mt-2 max-w-xs text-center text-[13px] leading-[19px] text-neutral-600">
            Unlock call, WhatsApp, and email for this vendor. One-time unlock on
            your device using InstaHelp credits.
          </Text>
        </View>

        <View className="mt-5 rounded-2xl border border-white/50 bg-white/80 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-bold uppercase tracking-widest text-neutral-500">
              Phone preview
            </Text>
            <Ionicons name="eye-off-outline" size={16} color="#737373" />
          </View>
          <Text className="mt-2 text-center font-mono text-[20px] font-extrabold tracking-widest text-neutral-900">
            {maskPhoneForDisplay(vendor.phone)}
          </Text>
        </View>

        <Pressable
          onPress={onReveal}
          accessibilityRole="button"
          accessibilityLabel="Reveal vendor contact"
          className="mt-5 overflow-hidden rounded-2xl"
        >
          <LinearGradient
            colors={["#003a85", "#004aad"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-4"
          >
            <Ionicons name="flash" size={18} color="#ffd500" />
            <Text className="text-[15px] font-extrabold text-white">
              Reveal Contact · {VENDOR_REVEAL_CREDIT_COST} Credits
            </Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
}
