import { SHOP_SYNC_POLL_MS } from "@/config/shopSheet";
import { syncShopCatalog } from "@/services/shop/shopSyncService";
import { useShopCatalogStore } from "@/store/shopCatalogStore";
import {
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { AppState, InteractionManager, type AppStateStatus } from "react-native";

type Props = PropsWithChildren<{
  /** When true, delay initial sync until after interactions settle. */
  deferStart?: boolean;
}>;

export function ShopSyncProvider({ children, deferStart = false }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const runSync = async (force = false) => {
      if (runningRef.current) return;
      runningRef.current = true;
      try {
        await syncShopCatalog({ force });
      } finally {
        runningRef.current = false;
      }
    };

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        void runSync(false);
      }, SHOP_SYNC_POLL_MS);
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

export function useShopSyncStatus() {
  const isSyncing = useShopCatalogStore((s) => s.isSyncing);
  const fetchFailed = useShopCatalogStore((s) => s.fetchFailed);
  const lastFetchedAt = useShopCatalogStore((s) => s.last_fetched_at);
  const pricesUpdatedFlash = useShopCatalogStore((s) => s.pricesUpdatedFlash);
  const clearPricesUpdatedFlash = useShopCatalogStore(
    (s) => s.clearPricesUpdatedFlash,
  );

  return {
    isSyncing,
    fetchFailed,
    lastFetchedAt,
    pricesUpdatedFlash,
    clearPricesUpdatedFlash,
    retry: () => syncShopCatalog({ force: true }),
  };
}
