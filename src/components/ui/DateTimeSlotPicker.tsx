import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { cardShadow, SPRING } from "@/constants/designSystem";
import {
  TIME_PRESETS,
  TIME_SLOTS,
  buildDateOptions,
  formatDateTimeSlot,
  isPresetValue,
  isSlotAvailable,
  parseDateTimeSlotValue,
  type TimeSlot,
} from "@/constants/timeSlots";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  value: string;
  onChange: (formatted: string) => void;
  error?: boolean;
  showCustomPicker?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PresetChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`rounded-full px-3 py-1.5 ${
        active
          ? "bg-accent"
          : "border border-neutral-200 bg-white"
      }`}
    >
      <Text
        className={`text-[11px] font-bold ${
          active ? "text-white" : "text-neutral-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DateCard({
  weekday,
  dayNum,
  month,
  isToday,
  active,
  onPress,
}: {
  weekday: string;
  dayNum: number;
  month: string;
  isToday: boolean;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, SPRING.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING.gentle);
      }}
      style={pressStyle}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="mr-2"
    >
      {active ? (
        <View className="h-[58px] w-[48px] items-center justify-center rounded-xl bg-accent">
          <Text className="text-[9px] font-bold uppercase tracking-wide text-white/80">
            {weekday}
          </Text>
          <Text className="text-base font-extrabold text-white">{dayNum}</Text>
          <Text className="text-[8px] font-semibold text-white/75">{month}</Text>
        </View>
      ) : (
        <View
          className={`h-[58px] w-[48px] items-center justify-center rounded-xl border bg-white ${
            isToday ? "border-accent/40" : "border-neutral-200"
          }`}
          style={cardShadow("sm")}
        >
          <Text
            className={`text-[9px] font-bold uppercase tracking-wide ${
              isToday ? "text-accent" : "text-neutral-400"
            }`}
          >
            {weekday}
          </Text>
          <Text
            className={`text-base font-extrabold ${
              isToday ? "text-accent-deep" : "text-neutral-800"
            }`}
          >
            {dayNum}
          </Text>
          <Text className="text-[8px] font-semibold text-neutral-400">
            {month}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

function SlotButton({
  slot,
  active,
  disabled,
  onPress,
}: {
  slot: TimeSlot;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      className={`mb-1.5 w-[31%] items-center rounded-xl px-1.5 py-2 ${
        active
          ? "bg-accent"
          : "border border-neutral-200 bg-neutral-50"
      }`}
      style={disabled ? { opacity: 0.35 } : undefined}
    >
      <Text
        className={`text-[10px] font-bold ${
          active ? "text-white" : "text-neutral-700"
        }`}
      >
        {slot.shortLabel}
      </Text>
    </Pressable>
  );
}

export function DateTimeSlotPicker({
  value,
  onChange,
  error = false,
  showCustomPicker = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const dateOptions = useMemo(() => buildDateOptions(7), []);
  const parsed = useMemo(() => parseDateTimeSlotValue(value), [value]);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    () => parsed?.dateKey ?? dateOptions[0]?.key ?? "",
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    () => parsed?.slotId ?? null,
  );

  const selectedDate =
    dateOptions.find((d) => d.key === selectedDateKey)?.date ??
    dateOptions[0]?.date ??
    new Date();

  const presetActive = isPresetValue(value);
  const customTimeActive = value && !presetActive && !parsed;

  const handleDateSelect = (key: string) => {
    setSelectedDateKey(key);
    if (selectedSlotId) {
      const date = dateOptions.find((d) => d.key === key)?.date;
      const slot = TIME_SLOTS.find((s) => s.id === selectedSlotId);
      if (date && slot && isSlotAvailable(date, slot)) {
        onChange(formatDateTimeSlot(date, slot));
        setOpen(false);
      } else {
        setSelectedSlotId(null);
      }
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!isSlotAvailable(selectedDate, slot)) return;
    setSelectedSlotId(slot.id);
    onChange(formatDateTimeSlot(selectedDate, slot));
    setOpen(false);
  };

  const handlePreset = (preset: string) => {
    setSelectedSlotId(null);
    onChange(preset);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel="Pick date and time"
        accessibilityState={{ expanded: open }}
        className={`min-h-[48px] flex-row items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 ${
          error
            ? "border-red-400"
            : open
              ? "border-accent"
              : "border-neutral-200"
        }`}
      >
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent-soft">
          <Ionicons name="calendar-outline" size={16} color="#171717" />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
            Date and time
          </Text>
          <Text
            className={`mt-0.5 text-[13px] font-bold ${
              value ? "text-neutral-900" : "text-neutral-400"
            }`}
            numberOfLines={1}
          >
            {value || "Tap to pick"}
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color="#9CA3AF"
        />
      </Pressable>

      {open ? (
        <Animated.View
          entering={FadeInDown.duration(220)}
          className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
        >
          <View className="p-3">
            <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
              Quick picks
            </Text>
            <View className="mb-3 flex-row flex-wrap gap-1.5">
              {TIME_PRESETS.map((preset) => (
                <PresetChip
                  key={preset}
                  label={preset}
                  active={value === preset}
                  onPress={() => handlePreset(preset)}
                />
              ))}
            </View>

            <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
              Select date
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 4 }}
            >
              {dateOptions.map((option) => (
                <DateCard
                  key={option.key}
                  weekday={option.isToday ? "Today" : option.weekday}
                  dayNum={option.dayNum}
                  month={option.month}
                  isToday={option.isToday}
                  active={!presetActive && selectedDateKey === option.key}
                  onPress={() => handleDateSelect(option.key)}
                />
              ))}
            </ScrollView>

            <Text className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
              Available slots
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {TIME_SLOTS.map((slot) => {
                const available = isSlotAvailable(selectedDate, slot);
                const active =
                  !presetActive &&
                  selectedSlotId === slot.id &&
                  parsed?.dateKey === selectedDateKey;
                return (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    active={active}
                    disabled={!available}
                    onPress={() => handleSlotSelect(slot)}
                  />
                );
              })}
            </View>

            {showCustomPicker ? (
              <View className="mt-2 border-t border-neutral-100 pt-2">
                <DateTimePickerField
                  label="Or pick exact time"
                  value={customTimeActive ? value : undefined}
                  onPick={(formatted) => {
                    setSelectedSlotId(null);
                    onChange(formatted);
                    setOpen(false);
                  }}
                />
              </View>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
