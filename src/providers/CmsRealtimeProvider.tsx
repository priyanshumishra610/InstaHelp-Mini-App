"use client";

import { useCmsRealtime } from "@/hooks/useCmsRealtime";
import { useQueryClient } from "@tanstack/react-query";

/** Listens for CMS WebSocket events and invalidates content caches. */
export function CmsRealtimeProvider() {
  const queryClient = useQueryClient();

  useCmsRealtime((module) => {
    queryClient.invalidateQueries({ queryKey: ["cms"] });
    if (module === "banners") {
      queryClient.invalidateQueries({ queryKey: ["cms", "weekly-offers"] });
    }
  });

  return null;
}
