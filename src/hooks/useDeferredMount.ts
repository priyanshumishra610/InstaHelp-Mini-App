import { PERF_HOME_DEFER_MS, PERF_MODE } from "@/constants/performance";
import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

/** Mount children only after first paint / short delay — keeps list scroll smooth. */
export function useDeferredMount(delayMs = PERF_HOME_DEFER_MS) {
  const [ready, setReady] = useState(PERF_MODE ? false : true);

  useEffect(() => {
    if (!PERF_MODE) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!cancelled) setReady(true);
      }, delayMs);
    });
    return () => {
      cancelled = true;
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [delayMs]);

  return ready;
}
