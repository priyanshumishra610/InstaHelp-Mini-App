import * as Location from "expo-location";

export type DeviceAddress = {
  address: string;
  shortAddress: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
};

export type DeviceAddressError =
  | "permission-denied"
  | "services-disabled"
  | "no-fix"
  | "no-address"
  | "unknown";

export class LocationFetchError extends Error {
  code: DeviceAddressError;
  constructor(code: DeviceAddressError, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Request foreground location permission. Resolves to `true` only when the
 * user grants permission. Surfaces "Settings" guidance through the caller.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const existing = await Location.getForegroundPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;

  const next = await Location.requestForegroundPermissionsAsync();
  return next.granted;
}

function compact<T>(arr: (T | null | undefined | "")[]): T[] {
  return arr.filter(Boolean) as T[];
}

function formatAddress(
  place: Location.LocationGeocodedAddress | undefined | null,
): { full: string; short: string } {
  if (!place) return { full: "", short: "" };

  const line1 = compact([
    place.name && place.name !== place.street ? place.name : null,
    place.streetNumber,
    place.street,
  ]).join(" ");

  const line2 = compact([place.subregion, place.district]).join(", ");
  const line3 = compact([place.city, place.region]).join(", ");
  const line4 = compact([place.postalCode, place.country]).join(" ");

  const full = compact([line1, line2, line3, line4]).join(", ");
  const short = compact([place.name || place.street, place.city || place.region]).join(", ");

  return { full, short };
}

/**
 * Get the device's current address with a single, cached-friendly call.
 * Throws a `LocationFetchError` with a stable code on failure.
 */
export async function fetchCurrentDeviceAddress(): Promise<DeviceAddress> {
  const servicesOn = await Location.hasServicesEnabledAsync().catch(() => true);
  if (!servicesOn) {
    throw new LocationFetchError(
      "services-disabled",
      "Location services are turned off. Turn them on and try again.",
    );
  }

  const granted = await requestLocationPermission();
  if (!granted) {
    throw new LocationFetchError(
      "permission-denied",
      "Location permission is required to detect your address.",
    );
  }

  let position: Location.LocationObject | null = null;
  try {
    position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    position = await Location.getLastKnownPositionAsync().catch(() => null);
  }

  if (!position) {
    throw new LocationFetchError(
      "no-fix",
      "We couldn't get a location fix. Try again outdoors or near a window.",
    );
  }

  const { latitude, longitude } = position.coords;

  const places = await Location.reverseGeocodeAsync({ latitude, longitude }).catch(
    () => [] as Location.LocationGeocodedAddress[],
  );

  const place = places[0];
  const formatted = formatAddress(place);
  if (!formatted.full) {
    throw new LocationFetchError(
      "no-address",
      "We got coordinates but no address. Try again or type it in.",
    );
  }

  return {
    address: formatted.full,
    shortAddress: formatted.short || formatted.full,
    city: place?.city ?? place?.region ?? "",
    region: place?.region ?? "",
    country: place?.country ?? "",
    postalCode: place?.postalCode ?? "",
    latitude,
    longitude,
  };
}
