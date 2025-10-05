// Weather data types for Open-Meteo API

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Prefecture
  admin2?: string; // County/District
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  precipitation: number;
  precipitation_probability: number;
  weather_code: number;
  wind_speed: number;
  cloud_cover: number;
}

export interface DailyWeather {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_sum: number;
  precipitation_probability_max: number;
  weather_code: number;
  wind_speed_max: number;
}

export interface WeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    region?: string;
  };
  current: {
    temperature: number;
    weather_code: number;
    wind_speed: number;
    precipitation: number;
  };
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  timezone: string;
  fetchedAt: string;
}

export interface WeatherSummary {
  condition: string;
  riskLevel: "low" | "medium" | "high";
  bestTimeWindow?: {
    start: string;
    end: string;
  };
  warnings: string[];
  recommendations: string[];
}
