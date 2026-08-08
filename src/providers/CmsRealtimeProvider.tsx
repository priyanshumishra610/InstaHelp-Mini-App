"use client";

import { PERF_CMS_DEFER_MS } from "@/constants/performance";
import { useCmsRealtime } from "@/hooks/useCmsRealtime";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

/** Listens for CMS WebSocket events and invalidates content caches. */
export function CmsRealtimeProvider() {
  const queryClient = useQueryClient();
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!cancelled) setActive(true);
      }, PERF_CMS_DEFER_MS);
    });
    return () => {
      cancelled = true;
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, []);

  useCmsRealtime(
    (module) => {
      queryClient.invalidateQueries({ queryKey: ["cms"] });
      if (module === "banners") {
        queryClient.invalidateQueries({ queryKey: ["cms", "weekly-offers"] });
      }
    },
    active,
  );

  return null;
}
