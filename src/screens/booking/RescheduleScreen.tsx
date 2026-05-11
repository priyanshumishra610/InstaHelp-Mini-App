import { Button } from "@/components/ui/Button";
import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { useBookingStore } from "@/store/bookingStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const PRESETS = [
  "Today, ASAP",
  "Today evening",
  "Tomorrow morning",
  "This weekend",
];

export function RescheduleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const merged = useMergedBookings();
  const updateBooking = useBookingStore((s) => s.updateBooking);

  const booking = useMemo(
    () => merged.find((b) => b.id === id),
    [merged, id],
  );

  const [time, setTime] = useState(booking?.preferredTime ?? "");
  const [notes, setNotes] = useState(booking?.notes ?? "");

  if (!booking) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Ionicons name="calendar-outline" size={26} color="#ffffff" />
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

  const cannotReschedule = booking.status === "completed";

  const save = () => {
    const next = time.trim();
    if (!next) return;
    updateBooking(booking.id, {
      preferredTime: next,
      notes: notes.trim() ? notes.trim() : undefined,
    });
    router.back();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-2 overflow-hidden rounded-3xl bg-accent p-5">
            <View
              pointerEvents="none"
              className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-blue"
            />
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
              Reschedule
            </Text>
            <Text
              className="mt-1 text-2xl font-extrabold text-accent-foreground"
              numberOfLines={1}
            >
              {booking.serviceLabel}
            </Text>
            <View className="mt-3">
              <StatusBadge status={booking.status} />
            </View>
            <Text className="mt-3 text-sm text-white/90">
              Pick a new preferred time. Concierge will confirm with the
              vendor and notify you.
            </Text>
          </View>

          {cannotReschedule ? (
            <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-accent-tint bg-accent-soft p-4">
              <Ionicons name="information-circle" size={18} color="#003a85" />
              <Text className="flex-1 text-xs font-medium text-accent-deep">
                This booking is completed, you can save updated notes but the
                time will not be honoured.
              </Text>
            </View>
          ) : null}

          <View className="mt-5 gap-5">
            <FormField label="New preferred time">
              <Input
                placeholder="e.g. Tomorrow 10 to 11 am"
                value={time}
                onChangeText={setTime}
              />
              <View className="mt-2 flex-row flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const on = time === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setTime(p)}
                      className={`rounded-full px-3 py-1.5 ${
                        on
                          ? "bg-accent"
                          : "border border-brand-line bg-white dark:border-brand-lineDark dark:bg-brand-cardDark"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          on
                            ? "text-accent-foreground"
                            : "text-neutral-700 dark:text-neutral-200"
                        }`}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View className="mt-3">
                <DateTimePickerField
                  label="Pick exact time"
                  value={time && !PRESETS.includes(time) ? time : undefined}
                  onPick={(formatted) => setTime(formatted)}
                />
              </View>
            </FormField>

            <FormField
              label="Notes for the pro (optional)"
              hint="Parking, gate code, anything that has changed."
            >
              <Input
                multiline
                className="min-h-[88px]"
                textAlignVertical="top"
                placeholder="Anything we should pass along."
                value={notes}
                onChangeText={setNotes}
              />
            </FormField>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button variant="outline" onPress={() => router.back()}>
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  size="md"
                  onPress={save}
                  disabled={!time.trim()}
                  accessibilityLabel="Save reschedule"
                >
                  Save changes
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
