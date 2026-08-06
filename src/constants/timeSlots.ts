export const TIME_PRESETS = [
  "Today, ASAP",
  "Today evening",
  "Tomorrow morning",
  "This weekend",
] as const;

export type TimePreset = (typeof TIME_PRESETS)[number];

export type TimeSlot = {
  id: string;
  label: string;
  shortLabel: string;
  startHour: number;
  endHour: number;
};

export const TIME_SLOTS: TimeSlot[] = [
  {
    id: "morning-early",
    label: "8:00 - 10:00 AM",
    shortLabel: "8-10 AM",
    startHour: 8,
    endHour: 10,
  },
  {
    id: "morning",
    label: "10:00 AM - 12:00 PM",
    shortLabel: "10-12 PM",
    startHour: 10,
    endHour: 12,
  },
  {
    id: "afternoon",
    label: "12:00 - 2:00 PM",
    shortLabel: "12-2 PM",
    startHour: 12,
    endHour: 14,
  },
  {
    id: "afternoon-late",
    label: "2:00 - 4:00 PM",
    shortLabel: "2-4 PM",
    startHour: 14,
    endHour: 16,
  },
  {
    id: "evening",
    label: "4:00 - 6:00 PM",
    shortLabel: "4-6 PM",
    startHour: 16,
    endHour: 18,
  },
  {
    id: "night",
    label: "6:00 - 8:00 PM",
    shortLabel: "6-8 PM",
    startHour: 18,
    endHour: 20,
  },
];

export type DateOption = {
  date: Date;
  key: string;
  weekday: string;
  dayNum: number;
  month: string;
  isToday: boolean;
  isTomorrow: boolean;
};

function startOfDay(d: Date) {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildDateOptions(count = 10): DateOption[] {
  const today = startOfDay(new Date());
  const options: DateOption[] = [];

  for (let i = 0; i < count; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    options.push({
      date,
      key: date.toISOString().slice(0, 10),
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString(undefined, { month: "short" }),
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }

  return options;
}

export function formatDayLabel(date: Date) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateTimeSlot(date: Date, slot: TimeSlot) {
  return `${formatDayLabel(date)}, ${slot.label}`;
}

export function isSlotAvailable(date: Date, slot: TimeSlot) {
  const now = new Date();
  if (!isSameDay(date, now)) return true;
  return slot.endHour > now.getHours();
}

export function parseDateTimeSlotValue(value: string): {
  dateKey: string;
  slotId: string;
} | null {
  if (!value || TIME_PRESETS.includes(value as TimePreset)) return null;

  for (const slot of TIME_SLOTS) {
    if (!value.includes(slot.label)) continue;
    const dayPart = value.replace(`, ${slot.label}`, "").trim();
    const options = buildDateOptions(14);
    const match = options.find((o) => formatDayLabel(o.date) === dayPart);
    if (match) {
      return { dateKey: match.key, slotId: slot.id };
    }
  }

  return null;
}

export function isPresetValue(value: string) {
  return TIME_PRESETS.includes(value as TimePreset);
}
