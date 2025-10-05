"use server";

import {
  geocodeLocation,
  fetchWeatherForecast,
  generateWeatherSummary,
} from "@/lib/weather";
import { WeatherData, GeocodingResult } from "@/lib/types/weather";

export interface WeatherActionResult {
  success: boolean;
  data?: WeatherData & { summary: ReturnType<typeof generateWeatherSummary> };
  error?: string;
  suggestions?: GeocodingResult[];
}

export async function getWeatherForLocation(
  locationName: string
): Promise<WeatherActionResult> {
  try {
    if (!locationName || locationName.trim().length === 0) {
      return {
        success: false,
        error: "Please provide a location name",
      };
    }

    // Geocode the location
    const geocodeResults = await geocodeLocation(locationName.trim());

    if (geocodeResults.length === 0) {
      return {
        success: false,
        error: `Could not find location "${locationName}". Please try a different name.`,
      };
    }

    // If multiple results, check if first one is clearly in Japan
    // Otherwise return suggestions for disambiguation
    const japanResults = geocodeResults.filter(
      (r) => r.country === "Japan" || r.country === "JP"
    );

    let selectedLocation: GeocodingResult;

    if (japanResults.length > 0) {
      // Prefer Japan locations
      selectedLocation = japanResults[0];
    } else if (geocodeResults.length > 1) {
      // Multiple non-Japan results - ask user to clarify
      return {
        success: false,
        error: "Multiple locations found. Please be more specific.",
        suggestions: geocodeResults.slice(0, 3),
      };
    } else {
      selectedLocation = geocodeResults[0];
    }

    // Fetch weather forecast
    const weatherData = await fetchWeatherForecast(
      selectedLocation.latitude,
      selectedLocation.longitude,
      selectedLocation.name,
      selectedLocation.country,
      selectedLocation.admin1
    );

    // Generate summary and recommendations
    const summary = generateWeatherSummary(weatherData);

    return {
      success: true,
      data: {
        ...weatherData,
        summary,
      },
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch weather data. Please try again.",
    };
  }
}
