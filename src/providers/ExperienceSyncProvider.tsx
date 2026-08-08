import { EXPERIENCE_SYNC_POLL_MS } from "@/config/experienceSheets";
import { syncExperienceCatalog } from "@/services/experiences/experienceSyncService";
import { useExperienceCatalogStore } from "@/store/experienceCatalogStore";
import {
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { AppState, InteractionManager, type AppStateStatus } from "react-native";

type Props = PropsWithChildren<{
  deferStart?: boolean;
}>;

export function ExperienceSyncProvider({ children, deferStart = false }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const runSync = async (force = false) => {
      if (runningRef.current) return;
      runningRef.current = true;
      try {
        await syncExperienceCatalog({ force });
      } finally {
        runningRef.current = false;
      }
    };

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        void runSync(false);
      }, EXPERIENCE_SYNC_POLL_MS);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const onAppState = (state: AppStateStatus) => {
      if (state === "active") {
        void runSync(false);
        startPolling();
      } else {
        stopPolling();
      }
    };

    const boot = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      void runSync(false);
      startPolling();
    };

    let cancelInteraction: { cancel: () => void } | null = null;
    let deferTimer: ReturnType<typeof setTimeout> | null = null;

    if (deferStart) {
      cancelInteraction = InteractionManager.runAfterInteractions(() => {
        deferTimer = setTimeout(boot, 1500);
      });
    } else {
      boot();
    }

    const sub = AppState.addEventListener("change", onAppState);
    return () => {
      cancelInteraction?.cancel();
      if (deferTimer) clearTimeout(deferTimer);
      stopPolling();
      sub.remove();
    };
  }, [deferStart]);

  return <>{children}</>;
}

export function useExperienceSyncStatus() {
  const isSyncing = useExperienceCatalogStore((s) => s.isSyncing);
  const fetchFailed = useExperienceCatalogStore((s) => s.fetchFailed);
  const lastFetchedAt = useExperienceCatalogStore((s) => s.last_fetched_at);

  return {
    isSyncing,
    fetchFailed,
    lastFetchedAt,
    retry: () => syncExperienceCatalog({ force: true }),
  };
}
