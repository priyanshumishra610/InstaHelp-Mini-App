import {
  getDemandNotificationData,
  scheduleSmartLocalDemandNotifications,
  type NotificationPersona,
} from "@/services/localDemandNotifications";
import { fetchWeatherHint, type WeatherHint } from "@/services/weatherContext";
import { openWhatsApp } from "@/utils/whatsapp";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { type Href, useRouter } from "expo-router";
import { useEffect, useRef } from "react";

function serviceFormHref(serviceId: string) {
  return `/(tabs)?service=${encodeURIComponent(
    serviceId,
  )}&source=notification` as Href;
}

function quickRequestHref(presetLabel: string, presetDescription: string) {
  const q = new URLSearchParams({
    presetLabel,
    presetDescription,
  });
  return `/request/custom?${q.toString()}` as Href;
}

export function useSmartLocalNotifications(
  favoriteServiceIds: string[],
  firstName: string | null = null,
  persona: NotificationPersona = "consumer",
) {
  const router = useRouter();
  const handledResponseIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let weatherHint: WeatherHint = "neutral";
      try {
        const last = await Location.getLastKnownPositionAsync();
        if (last?.coords) {
          weatherHint = await fetchWeatherHint(
            last.coords.latitude,
            last.coords.longitude,
          );
        }
      } catch {
        weatherHint = "neutral";
      }

      if (cancelled) return;

      await scheduleSmartLocalDemandNotifications({
        favoriteServiceIds,
        firstName,
        persona,
        weatherHint,
      }).catch(() => {
        // Local notifications should never block the app shell.
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [favoriteServiceIds, firstName, persona]);

  useEffect(() => {
    const handleResponse = (response: Notifications.NotificationResponse | null) => {
      const data = getDemandNotificationData(response);
      if (!data || !response) return;

      const responseId = response.notification.request.identifier;
      if (handledResponseIdRef.current === responseId) return;
      handledResponseIdRef.current = responseId;

      if (data.action === "whatsapp") {
        void openWhatsApp(data.whatsappMessage);
        return;
      }

      if (data.action === "quick_request") {
        router.push(
          quickRequestHref(
            data.quickPresetLabel ?? "Quick local request",
            data.quickPresetDescription ?? "",
          ),
        );
        return;
      }

      router.push(serviceFormHref(data.serviceId));
    };

    void Notifications.getLastNotificationResponseAsync()
      .then(handleResponse)
      .catch(() => {});

    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleResponse,
    );

    return () => {
      subscription.remove();
    };
  }, [router]);
}
