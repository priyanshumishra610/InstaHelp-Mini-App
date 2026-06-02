import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

type Props = {
  value?: string;
  onPick: (formatted: string, date: Date) => void;
  label?: string;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatPicked(d: Date) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const dayPart = isSameDay(d, now)
    ? "Today"
    : isSameDay(d, tomorrow)
      ? "Tomorrow"
      : d.toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${dayPart}, ${timePart}`;
}

export function DateTimePickerField({ value, onPick, label }: Props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"date" | "time">("date");
  const [draft, setDraft] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  });

  const start = () => {
    const seed = new Date();
    seed.setMinutes(0, 0, 0);
    seed.setHours(seed.getHours() + 1);
    setDraft(seed);
    setStage("date");
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setStage("date");
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (event.type === "dismissed") {
      close();
      return;
    }
    if (!selected) return;
    if (stage === "date") {
      const next = new Date(draft);
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDraft(next);
      setStage("time");
      return;
    }
    const merged = new Date(draft);
    merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onPick(formatPicked(merged), merged);
    close();
  };

  const handleIosChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (!selected) return;
    setDraft(selected);
  };

  const confirmIos = () => {
    onPick(formatPicked(draft), draft);
    close();
  };

  return (
    <>
      <Pressable
        onPress={start}
        accessibilityRole="button"
        accessibilityLabel={label ?? "Pick a date and time"}
        className="flex-row items-center gap-3 rounded-2xl border border-brand-line bg-white px-4 py-3 active:bg-neutral-100 dark:border-brand-lineDark dark:bg-brand-cardDark"
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
          <Ionicons name="time-outline" size={16} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            {label ?? "Choose date & time"}
          </Text>
          <Text
            className={`mt-0.5 text-sm font-semibold ${
              value
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
            numberOfLines={1}
          >
            {value || "Tap to open the clock"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
      </Pressable>

      {Platform.OS === "android" && open ? (
        <DateTimePicker
          value={draft}
          mode={stage}
          minimumDate={new Date()}
          is24Hour={false}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          transparent
          animationType="fade"
          visible={open}
          onRequestClose={close}
        >
          <Pressable
            onPress={close}
            className="flex-1 items-center justify-end bg-black/40"
          >
            <Pressable
              onPress={() => {}}
              className="w-full rounded-t-3xl bg-white p-5 dark:bg-neutral-900"
            >
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-bold text-neutral-900 dark:text-white">
                  Pick date and time
                </Text>
                <Pressable onPress={close}>
                  <Text className="text-sm font-semibold text-neutral-500">
                    Cancel
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode="datetime"
                display="inline"
                minimumDate={new Date()}
                onChange={handleIosChange}
                themeVariant="light"
              />
              <Pressable
                onPress={confirmIos}
                className="mt-2 items-center justify-center rounded-2xl bg-accent py-3.5 active:opacity-90"
              >
                <Text className="text-sm font-bold text-accent-foreground">
                  Use this time
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}
