import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useProfileStore } from "@/store/profileStore";
import { BOOKING_STATUS_LABEL } from "@/types/booking";
import type { Booking } from "@/types/booking";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function buildReceiptText(b: Booking, phone: string | null, name?: string) {
  const lines = [
    "InstaHelp booking receipt",
    "----------------------------",
    `Booking ID: ${b.id}`,
    `Service: ${b.serviceLabel}`,
    `Status: ${BOOKING_STATUS_LABEL[b.status]}`,
    `Created: ${formatDate(b.createdAt)}`,
    `Last update: ${formatDate(b.updatedAt)}`,
    `Preferred time: ${b.preferredTime || "Flexible"}`,
    "",
    "Description:",
    b.description,
  ];
  if (b.notes) {
    lines.push("", "Notes:", b.notes);
  }
  if (b.rating) {
    lines.push(
      "",
      `Rating: ${"★".repeat(b.rating.stars)}${"☆".repeat(5 - b.rating.stars)}`,
    );
    if (b.rating.comment) lines.push(b.rating.comment);
  }
  lines.push(
    "",
    "Customer:",
    [name?.trim(), phone].filter(Boolean).join(" · ") || "Member",
  );
  return lines.join("\n");
}

export function ReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const merged = useMergedBookings();
  const phone = useAuthPhone();
  const profile = useProfileStore((s) => s.profile);
  const [copied, setCopied] = useState(false);

  const booking = useMemo(
    () => merged.find((b) => b.id === id),
    [merged, id],
  );

  if (!booking) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Ionicons name="receipt-outline" size={26} color="#ffffff" />
          </View>
          <Text className="mt-4 text-center text-base font-bold text-neutral-900 dark:text-white">
            Booking not found
          </Text>
          <View className="mt-6">
            <Button variant="outline" onPress={() => router.back()}>
              Go back
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  const receiptText = buildReceiptText(booking, phone, profile?.name);

  const onShare = async () => {
    try {
      await Share.share({
        message: receiptText,
        title: `InstaHelp booking ${booking.id}`,
      });
    } catch (e) {
      Alert.alert(
        "Share failed",
        e instanceof Error ? e.message : "Could not open the share sheet.",
      );
    }
  };

  const onCopy = async () => {
    try {
      await Clipboard.setStringAsync(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      Alert.alert("Copy failed", "Could not copy receipt to clipboard.");
    }
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="mt-2 overflow-hidden rounded-3xl bg-accent p-5">
          <View
            pointerEvents="none"
            className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-blue"
          />
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
            Receipt
          </Text>
          <Text
            className="mt-1 text-2xl font-extrabold text-accent-foreground"
            numberOfLines={1}
          >
            {booking.serviceLabel}
          </Text>
          <Text className="mt-1 text-xs font-mono text-white/85">
            {booking.id}
          </Text>
          <View className="mt-3">
            <StatusBadge status={booking.status} />
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5 dark:border-brand-lineDark dark:bg-brand-cardDark">
          <Row label="Created" value={formatDate(booking.createdAt)} />
          <Divider />
          <Row label="Last update" value={formatDate(booking.updatedAt)} />
          <Divider />
          <Row
            label="Preferred time"
            value={booking.preferredTime || "Flexible"}
          />
          <Divider />
          <Row label="Status" value={BOOKING_STATUS_LABEL[booking.status]} />
        </View>

        <Text className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          Description
        </Text>
        <View className="rounded-2xl border border-brand-line bg-white p-4 dark:border-brand-lineDark dark:bg-brand-cardDark">
          <Text className="text-sm leading-5 text-neutral-800 dark:text-neutral-100">
            {booking.description}
          </Text>
          {booking.notes ? (
            <>
              <View className="my-3 h-px bg-brand-line dark:bg-brand-lineDark" />
              <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                Notes
              </Text>
              <Text className="mt-1 text-sm text-neutral-700 dark:text-neutral-200">
                {booking.notes}
              </Text>
            </>
          ) : null}
        </View>

        {booking.rating ? (
          <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5 dark:border-brand-lineDark dark:bg-brand-cardDark">
            <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              Your rating
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons
                  key={n}
                  name={n <= booking.rating!.stars ? "star" : "star-outline"}
                  size={20}
                  color={n <= booking.rating!.stars ? "#ffd500" : "#d4d4d4"}
                />
              ))}
              <Text className="ml-2 text-sm font-bold text-neutral-900 dark:text-white">
                {booking.rating.stars}/5
              </Text>
            </View>
            {booking.rating.comment ? (
              <Text className="mt-3 text-sm text-neutral-700 dark:text-neutral-200">
                {booking.rating.comment}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View className="mt-5 rounded-3xl border border-brand-line bg-white p-5 dark:border-brand-lineDark dark:bg-brand-cardDark">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            Customer
          </Text>
          <Text className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
            {profile?.name?.trim() || "Member"}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {phone ?? "Phone unavailable"}
          </Text>
        </View>

        <View className="mt-6 gap-3">
          <Pressable
            onPress={onShare}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 active:opacity-90"
          >
            <Ionicons name="share-outline" size={18} color="#ffffff" />
            <Text className="text-sm font-bold text-accent-foreground">
              Share receipt
            </Text>
          </Pressable>
          <Pressable
            onPress={onCopy}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-brand-line bg-white py-3.5 active:bg-neutral-100 dark:border-brand-lineDark dark:bg-brand-cardDark"
          >
            <Ionicons
              name={copied ? "checkmark" : "copy-outline"}
              size={18}
              color={copied ? "#004aad" : "#525252"}
            />
            <Text
              className={`text-sm font-bold ${
                copied
                  ? "text-accent-deep"
                  : "text-neutral-800 dark:text-neutral-100"
              }`}
            >
              {copied ? "Copied to clipboard" : "Copy as text"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-2">
      <Text className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
      <Text
        className="text-sm font-semibold text-neutral-900 dark:text-white"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-brand-line dark:bg-brand-lineDark" />;
}
