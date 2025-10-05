"use server";

import { WeatherData, WeatherSummary } from "@/lib/types/weather";

type GenerateTrekPlanInput = {
  destination: string;
  weather: WeatherData;
  summary: WeatherSummary;
  userQuestion?: string;
};

function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("Missing GROQ_API_KEY in environment");
  }
  return key;
}

function buildPrompt(input: GenerateTrekPlanInput): { system: string; user: string } {
  const { destination, weather, summary, userQuestion } = input;
  const isJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf\uFF66-\uFF9D]/.test(
    `${destination}\n${userQuestion || ""}`
  );

  // Compact the weather payload for the prompt to keep tokens small
  const compact = {
    location: weather.location,
    timezone: weather.timezone,
    fetchedAt: weather.fetchedAt,
    current: weather.current,
    daily: weather.daily.slice(0, 3),
    hourly: weather.hourly.slice(0, 12),
    summary,
  };

  const system = [
    "You are TrekMate, an expert trekking and travel guide for Japan.",
    isJapanese
      ? "Respond in natural Japanese. Be concise, practical, and safety-focused."
      : "Respond in concise English. Be practical and safety-focused.",
  ].join(" ");

  const user = [
    `DESTINATION: ${destination}`,
    `WEATHER_JSON: ${JSON.stringify(compact)}`,
    userQuestion ? `QUESTION: ${userQuestion}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

export async function generateTrekPlan(input: GenerateTrekPlanInput): Promise<string> {
  const apiKey = getGroqApiKey();
  const { system, user } = buildPrompt(input);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      temperature: 0.6,
      max_tokens: 900,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    // Keep server action fast; Groq is quick, but set a reasonable timeout via Next fetch options
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Groq API error: ${response.status} ${response.statusText} ${text}`);
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned empty response");
  }
  return content.trim();
}


