import * as Location from "expo-location";
import { useEffect, useState } from "react";

export function useVendorUserLocation(enabled = true) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      } catch {
        /* stay null — UI falls back to city centroid */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return coords;
}
