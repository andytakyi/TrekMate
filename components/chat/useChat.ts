"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, ConversationPhase } from "@/lib/types/chat";
import { WeatherData, WeatherSummary } from "@/lib/types/weather";
import { getWeatherForLocation } from "@/app/actions/weather";
import { generateTrekPlan } from "@/app/actions/ai";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm TrekMate AI. Where do you want to trek/travel in Japan? 🏔️",
    },
  ]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<ConversationPhase>("askDestination");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<string>(() => {
    if (typeof navigator !== "undefined" && Array.isArray((navigator as any).languages)) {
      return (navigator as any).languages.includes("ja") ? "ja-JP" : "en-US";
    }
    return "en-US";
  });

  const [destination, setDestination] = useState("");
  const [weatherContext, setWeatherContext] = useState<
    { weather: WeatherData; summary: WeatherSummary } | null
  >(null);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop?.();
        }
      } catch {}
    };
  }, []);

  const isSpeechSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in (window as any) || "webkitSpeechRecognition" in (window as any));

  const ensureRecognition = () => {
    if (!isSpeechSupported) return null;
    if (!recognitionRef.current) {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec: any = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      recognitionRef.current = rec;
    }
    return recognitionRef.current;
  };

  const startListening = () => {
    const rec = ensureRecognition();
    if (!rec) return;
    try {
      rec.lang = speechLang;
      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0]?.transcript || "")
          .join(" ")
          .trim();
        if (transcript) {
          setInput((prev) => (prev ? (prev.endsWith(" ") ? prev : prev + " ") + transcript : transcript));
        }
      };
      rec.onerror = () => {
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    setIsListening(false);
  };

  const toggleListening = () => {
    if (!isSpeechSupported) return;
    if (isListening) stopListening();
    else startListening();
  };

  const addMessage = useCallback(
    (
      role: "user" | "assistant",
      content: string,
      weatherData?: { weather: WeatherData; summary: WeatherSummary }
    ) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          role,
          content,
          weatherData,
        },
      ]);
    },
    []
  );

  const generateFollowUpSuggestions = useCallback((): string[] => {
    if (weatherContext) {
      const loc = weatherContext.weather.location?.name || destination || "this trek";
      return [
        `Suggest a 2-day itinerary around ${loc}`,
        "How will the weather affect difficulty?",
        "What gear should I pack for these conditions?",
      ];
    }
    return [
      "What are popular treks nearby?",
      "What is the best season to visit?",
      "Any beginner-friendly routes?",
    ];
  }, [weatherContext, destination]);

  const send = async (overrideText?: string) => {
    const prepared = (overrideText ?? input).trim();
    if (!prepared || isLoading) return;

    setFollowUpSuggestions([]);
    const userMessage = prepared;
    if (overrideText === undefined) setInput("");
    addMessage("user", userMessage);
    setIsLoading(true);

    try {
      if (phase === "askDestination") {
        const result = await getWeatherForLocation(userMessage);
        if (result.success && result.data) {
          const { summary, ...weather } = result.data;
          setDestination(userMessage);
          setWeatherContext({ weather, summary });

          addMessage("assistant", `Here's the weather forecast for ${weather.location.name}:`, {
            weather,
            summary,
          });

          try {
            const plan = await generateTrekPlan({ destination: userMessage, weather, summary });
            addMessage("assistant", plan);
          } catch (e) {
            console.error("AI plan error:", e);
            addMessage("assistant", "I couldn't generate the trek plan right now. You can still ask questions about your trek.");
          }

          setTimeout(() => {
            addMessage("assistant", "Ask me follow-up questions or request adjustments (distance, pace, budget). 🏔️");
            setFollowUpSuggestions(generateFollowUpSuggestions());
            setPhase("chat");
          }, 200);
        } else if (result.suggestions && result.suggestions.length > 0) {
          const suggestionsMsg =
            `I found multiple locations:\n\n` +
            result.suggestions.map((s, i) => `${i + 1}. ${s.name}, ${s.admin1 || ""} ${s.country}`).join("\n") +
            `\n\nPlease specify which one.`;
          addMessage("assistant", suggestionsMsg);
        } else {
          addMessage("assistant", result.error || "Sorry, I couldn't find that location. Please try again.");
        }
      } else {
        if (!weatherContext) {
          addMessage("assistant", "Please provide a destination first so I can tailor advice.");
        } else {
          try {
            const reply = await generateTrekPlan({
              destination,
              weather: weatherContext.weather,
              summary: weatherContext.summary,
              userQuestion: userMessage,
            });
            addMessage("assistant", reply);
            setFollowUpSuggestions(generateFollowUpSuggestions());
          } catch (e) {
            console.error("AI follow-up error:", e);
            addMessage("assistant", "I couldn't process that question right now. Please try again.");
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage("assistant", "Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (phase) {
      case "askDestination":
        return "e.g., Mt. Fuji, Tokyo, Kyoto...";
      default:
        return "Ask about the weather or your trek...";
    }
  };

  return {
    // state
    messages,
    input,
    phase,
    isLoading,
    isListening,
    speechLang,
    messagesEndRef,
    inputRef,
    followUpSuggestions,
    // actions
    setInput,
    send,
    getPlaceholder,
    // speech
    isSpeechSupported,
    toggleListening,
    setSpeechLang,
  } as const;
}


