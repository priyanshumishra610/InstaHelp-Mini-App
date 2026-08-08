import { PERF_MODE } from "@/constants/performance";

/** Soft floating glass orbs — disabled in perf mode. */
export function HomeAmbientOrbs() {
  if (PERF_MODE) return null;
  return null;
}
