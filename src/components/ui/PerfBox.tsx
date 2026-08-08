import { PERF_MODE } from "@/constants/performance";
import { MotiView } from "moti";
import { View } from "react-native";

/** View in perf mode; MotiView otherwise (spread Moti props only when !PERF_MODE). */
export const PerfBox = PERF_MODE ? View : MotiView;
