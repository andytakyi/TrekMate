import {
  GeocodingResult,
  WeatherData,
  HourlyWeather,
  DailyWeather,
  WeatherSummary,
} from "./types/weather";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Weather code to description mapping (WMO codes)
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Geocode a location name to coordinates
 */
export async function geocodeLocation(
  locationName: string
): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name: locationName,
    count: "5",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_API}?${params}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Location "${locationName}" not found`);
  }

  return data.results.map((result: any) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
    admin2: result.admin2,
  }));
}

/**
 * Fetch weather forecast for coordinates
 */
export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  locationName: string,
  country: string,
  region?: string
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current:
      "temperature_2m,weather_code,wind_speed_10m,precipitation",
    hourly:
      "temperature_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,cloud_cover",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7",
  });

  const response = await fetch(`${WEATHER_API}?${params}`, {
    next: { revalidate: 600 }, // Cache for 10 minutes
  });

  if (!response.ok) {
    throw new Error(`Weather API failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Parse hourly data (next 72 hours)
  const hourly: HourlyWeather[] = [];
  const maxHours = Math.min(72, data.hourly.time.length);
  for (let i = 0; i < maxHours; i++) {
    hourly.push({
      time: data.hourly.time[i],
      temperature: data.hourly.temperature_2m[i],
      precipitation: data.hourly.precipitation[i],
      precipitation_probability: data.hourly.precipitation_probability[i] || 0,
      weather_code: data.hourly.weather_code[i],
      wind_speed: data.hourly.wind_speed_10m[i],
      cloud_cover: data.hourly.cloud_cover[i],
    });
  }

  // Parse daily data
  const daily: DailyWeather[] = [];
  for (let i = 0; i < data.daily.time.length; i++) {
    daily.push({
      date: data.daily.time[i],
      temperature_max: data.daily.temperature_2m_max[i],
      temperature_min: data.daily.temperature_2m_min[i],
      precipitation_sum: data.daily.precipitation_sum[i],
      precipitation_probability_max:
        data.daily.precipitation_probability_max[i] || 0,
      weather_code: data.daily.weather_code[i],
      wind_speed_max: data.daily.wind_speed_10m_max[i],
    });
  }

  return {
    location: {
      name: locationName,
      latitude,
      longitude,
      country,
      region,
    },
    current: {
      temperature: data.current.temperature_2m,
      weather_code: data.current.weather_code,
      wind_speed: data.current.wind_speed_10m,
      precipitation: data.current.precipitation,
    },
    hourly,
    daily,
    timezone: data.timezone,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Generate weather summary with recommendations
 */
export function generateWeatherSummary(weather: WeatherData): WeatherSummary {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  // Analyze next 24 hours
  const next24Hours = weather.hourly.slice(0, 24);

  // Check for heavy precipitation
  const maxPrecip = Math.max(...next24Hours.map((h) => h.precipitation));
  const avgPrecipProb =
    next24Hours.reduce((sum, h) => sum + h.precipitation_probability, 0) / 24;

  if (maxPrecip > 10) {
    warnings.push("Heavy rain expected (>10mm/hour)");
    riskLevel = "high";
  } else if (maxPrecip > 5 && riskLevel === "low") {
    warnings.push("Moderate rain expected");
    riskLevel = "medium";
  }

  if (avgPrecipProb > 70) {
    warnings.push("High chance of precipitation throughout the day");
  }

  // Check wind speed
  const maxWind = Math.max(...next24Hours.map((h) => h.wind_speed));
  if (maxWind > 40) {
    warnings.push("Strong winds expected (>40 km/h)");
    riskLevel = "high";
  } else if (maxWind > 25 && riskLevel === "low") {
    warnings.push("Moderate winds expected");
    riskLevel = "medium";
  }

  // Find best time window (lowest precip probability, good conditions)
  let bestWindow: { start: string; end: string } | undefined;
  let bestScore = -1;
  
  for (let i = 0; i < next24Hours.length - 3; i++) {
    const window = next24Hours.slice(i, i + 4); // 4-hour windows
    const score =
      100 -
      window.reduce((sum, h) => sum + h.precipitation_probability, 0) / 4 -
      window.reduce((sum, h) => sum + h.wind_speed, 0) / 4;

    if (score > bestScore && score > 50) {
      bestScore = score;
      bestWindow = {
        start: window[0].time,
        end: window[window.length - 1].time,
      };
    }
  }

  // Generate recommendations
  if (riskLevel === "low") {
    recommendations.push("Good conditions for trekking");
  } else if (riskLevel === "medium") {
    recommendations.push("Proceed with caution, bring rain gear");
    recommendations.push("Check weather updates before departure");
  } else {
    recommendations.push("Consider postponing or choosing an alternate route");
    recommendations.push("If proceeding, ensure proper safety equipment");
  }

  if (maxWind > 25) {
    recommendations.push("Secure loose items and avoid exposed ridges");
  }

  const currentCondition =
    WEATHER_CODES[weather.current.weather_code] || "Unknown";

  return {
    condition: currentCondition,
    riskLevel,
    bestTimeWindow: bestWindow,
    warnings: warnings.length > 0 ? warnings : ["No significant warnings"],
    recommendations,
  };
}

/**
 * Get weather description from code
 */
export function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code] || "Unknown";
}
