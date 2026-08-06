import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useMergedBookings } from "@/hooks/useMergedBookings";
import { useBookingStore } from "@/store/bookingStore";
import type { BookingRating } from "@/types/booking";
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

const STAR_LABELS: Record<number, string> = {
  1: "Disappointing",
  2: "Below average",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

const QUICK_TAGS = [
  "Punctual",
  "Polite",
  "Skilled",
  "Clean work",
  "Fair pricing",
  "Communicated well",
];

export function RateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const merged = useMergedBookings();
  const updateBooking = useBookingStore((s) => s.updateBooking);

  const booking = useMemo(
    () => merged.find((b) => b.id === id),
    [merged, id],
  );

  const initialStars = (booking?.rating?.stars ?? 0) as 0 | 1 | 2 | 3 | 4 | 5;
  const [stars, setStars] = useState<0 | 1 | 2 | 3 | 4 | 5>(initialStars);
  const [comment, setComment] = useState(booking?.rating?.comment ?? "");
  const [tags, setTags] = useState<string[]>([]);

  if (!booking) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Ionicons name="star-outline" size={26} color="#ffffff" />
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

  const isCompleted = booking.status === "completed";

  const toggleTag = (t: string) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const submit = () => {
    if (stars === 0) return;
    const merged = [
      comment.trim(),
      tags.length ? `Tags: ${tags.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    const rating: BookingRating = {
      stars: stars as BookingRating["stars"],
      comment: merged || undefined,
      ratedAt: new Date().toISOString(),
    };
    updateBooking(booking.id, { rating });
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
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
              Rate your experience
            </Text>
            <Text
              className="mt-1 text-2xl font-extrabold text-accent-foreground"
              numberOfLines={1}
            >
              {booking.serviceLabel}
            </Text>
            <Text className="mt-1 text-sm text-white/90">
              How was your concierge experience?
            </Text>
          </View>

          {!isCompleted ? (
            <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-accent-tint bg-accent-soft p-4">
              <Ionicons name="information-circle" size={18} color="#003780" />
              <Text className="flex-1 text-xs font-medium text-accent-deep">
                Best to rate after the job is marked completed. Your input is
                saved either way.
              </Text>
            </View>
          ) : null}

          <View className="mt-6 items-center rounded-3xl border border-brand-line bg-white p-6 dark:border-brand-lineDark dark:bg-brand-cardDark">
            <View className="flex-row items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= stars;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setStars(n as typeof stars)}
                    accessibilityRole="button"
                    accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={filled ? "star" : "star-outline"}
                      size={36}
                      color={filled ? "#ffd500" : "#d4d4d4"}
                    />
                  </Pressable>
                );
              })}
            </View>
            <Text
              className={`mt-3 text-sm font-bold ${
                stars > 0
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {stars > 0 ? STAR_LABELS[stars] : "Tap a star to rate"}
            </Text>
          </View>

          <Text className="mb-3 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            What stood out?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {QUICK_TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <Pressable
                  key={t}
                  onPress={() => toggleTag(t)}
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
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-6">
            <FormField
              label="Tell us more (optional)"
              hint="Helps us coach the vendor for next time."
            >
              <Input
                multiline
                className="min-h-[100px]"
                textAlignVertical="top"
                placeholder="What worked, what could be better?"
                value={comment}
                onChangeText={setComment}
              />
            </FormField>
          </View>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1">
              <Button variant="outline" onPress={() => router.back()}>
                Cancel
              </Button>
            </View>
            <View className="flex-1">
              <Button
                size="md"
                onPress={submit}
                disabled={stars === 0}
                accessibilityLabel="Submit rating"
              >
                {booking.rating ? "Update rating" : "Submit rating"}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
