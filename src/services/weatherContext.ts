export type WeatherHint = "rain" | "heat" | "neutral";

const RAINY_WEATHER_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
]);

/**
 * Lightweight, no-key weather hint for copy personalization.
 * Best-effort: failures resolve to neutral.
 */
export async function fetchWeatherHint(
  latitude: number,
  longitude: number,
): Promise<WeatherHint> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m,precipitation,rain,weather_code");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString());
    if (!res.ok) return "neutral";

    const json = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        precipitation?: number;
        rain?: number;
        weather_code?: number;
      };
    };

    const current = json.current;
    if (!current) return "neutral";

    const precip = Number(current.precipitation ?? 0);
    const rain = Number(current.rain ?? 0);
    const code = Number(current.weather_code ?? 0);
    const temp = Number(current.temperature_2m ?? 0);

    if (precip > 0.15 || rain > 0 || RAINY_WEATHER_CODES.has(code)) {
      return "rain";
    }
    if (Number.isFinite(temp) && temp >= 33) {
      return "heat";
    }
    return "neutral";
  } catch {
    return "neutral";
  }
}
