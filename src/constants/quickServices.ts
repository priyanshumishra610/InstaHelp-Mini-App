export type QuickService = {
  id: string;
  label: string;
  icon: "clean" | "bolt" | "water" | "car" | "package" | "briefcase" | "plane" | "tool";
};

export const QUICK_SERVICES: QuickService[] = [
  { id: "cleaner", label: "Cleaner", icon: "clean" },
  { id: "electrician", label: "Electrician", icon: "bolt" },
  { id: "plumber", label: "Plumber", icon: "water" },
  { id: "driver", label: "Driver", icon: "car" },
  { id: "packers", label: "Packers", icon: "package" },
  { id: "ca", label: "CA", icon: "briefcase" },
  { id: "travel", label: "Travel", icon: "plane" },
  { id: "repairs", label: "Repairs", icon: "tool" },
];
