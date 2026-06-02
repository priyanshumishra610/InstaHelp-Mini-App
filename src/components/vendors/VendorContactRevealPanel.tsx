import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { maskPhoneForDisplay, normalizePhoneDigits } from "@/utils/vendorPhone";
import { dialPhone, emailVendor, openVendorWhatsApp } from "@/utils/vendorContactActions";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  vendor: VendorRecord;
  unlocked: boolean;
  onReveal: () => void;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="border-b border-neutral-100 py-3 last:border-b-0">
      <Text className="text-[12px] text-neutral-500">{label}</Text>
      <Text className="mt-0.5 text-[15px] text-neutral-900">{value}</Text>
    </View>
  );
}

export function VendorContactRevealPanel({ vendor, unlocked, onReveal }: Props) {
  const name = vendorDisplayName(vendor);
  const digits = normalizePhoneDigits(vendor.phone);

  if (unlocked) {
    return (
      <View className="rounded-xl border border-neutral-200 bg-white p-4">
        <InfoRow label="Phone" value={vendor.phone ?? "Not available"} />
        {vendor.email ? <InfoRow label="Email" value={vendor.email} /> : null}
        <InfoRow
          label="Address"
          value={vendor.address || `${vendor.areaLabel}, Bengaluru`}
        />

        <View className="mt-4 flex-row gap-2">
          <Pressable
            onPress={() => dialPhone(vendor.phone)}
            disabled={!digits}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-accent py-3 active:opacity-90 disabled:opacity-40"
          >
            <Ionicons name="call" size={18} color="#ffffff" />
            <Text className="text-[14px] font-semibold text-white">Call</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              openVendorWhatsApp(
                vendor.phone,
                `Hi ${name}, I found you on InstaHelp and would like to book a service.`,
              )
            }
            disabled={digits.length < 8}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 active:bg-neutral-50 disabled:opacity-40"
          >
            <Ionicons name="logo-whatsapp" size={18} color="#16a34a" />
            <Text className="text-[14px] font-semibold text-neutral-800">
              WhatsApp
            </Text>
          </Pressable>
        </View>
        {vendor.email ? (
          <Pressable
            onPress={() =>
              emailVendor(vendor.email, `Inquiry via InstaHelp — ${name}`)
            }
            className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 active:bg-neutral-50"
          >
            <Ionicons name="mail-outline" size={18} color="#7C3AED" />
            <Text className="text-[14px] font-semibold text-neutral-800">
              Email
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View className="rounded-xl border border-neutral-200 bg-white p-4">
      <View className="items-center py-2">
        <Ionicons name="lock-closed-outline" size={28} color="#7C3AED" />
        <Text className="mt-2 text-[16px] font-semibold text-neutral-900">
          Contact locked
        </Text>
        <Text className="mt-1 text-center text-[13px] leading-5 text-neutral-600">
          Use {VENDOR_REVEAL_CREDIT_COST} credits to unlock call and WhatsApp for
          this vendor.
        </Text>
      </View>

      <View className="mt-3 rounded-lg bg-neutral-50 px-3 py-2.5">
        <Text className="text-center text-[15px] font-medium tracking-wide text-neutral-700">
          {maskPhoneForDisplay(vendor.phone)}
        </Text>
      </View>

      <Pressable
        onPress={onReveal}
        accessibilityRole="button"
        accessibilityLabel="Reveal vendor contact"
        className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-accent py-3.5 active:opacity-90"
      >
        <Ionicons name="lock-open-outline" size={18} color="#ffffff" />
        <Text className="text-[14px] font-semibold text-white">
          Reveal contact · {VENDOR_REVEAL_CREDIT_COST} credits
        </Text>
      </Pressable>
    </View>
  );
}
