import { WeatherData, WeatherSummary } from "./weather";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  weatherData?: { weather: WeatherData; summary: WeatherSummary };
};

export type ConversationPhase = "askDestination" | "chat";


