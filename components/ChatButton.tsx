"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getWeatherForLocation } from "@/app/actions/weather";
import { generateTrekPlan } from "@/app/actions/ai";
import { WeatherData, WeatherSummary } from "@/lib/types/weather";
import WeatherCard from "./WeatherCard";
import MarkdownMessage from "./MarkdownMessage";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  weatherData?: { weather: WeatherData; summary: WeatherSummary };
};

type ConversationPhase = "askDestination" | "chat";

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm TrekMate AI. Where do you want to trek in Japan? 🏔️",
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

  // Weather context
  const [destination, setDestination] = useState("");
  const [weatherContext, setWeatherContext] = useState<
    { weather: WeatherData; summary: WeatherSummary } | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatPanelRef.current &&
        !chatPanelRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('button[aria-label="Open chat"]')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Cleanup speech recognition on unmount
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    addMessage("user", userMessage);
    setIsLoading(true);

    try {
      if (phase === "askDestination") {
        // Fetch weather for destination
        const result = await getWeatherForLocation(userMessage);

        if (result.success && result.data) {
          const { summary, ...weather } = result.data;
          setDestination(userMessage);
          setWeatherContext({ weather, summary });

          // Add weather card message
          addMessage(
            "assistant",
            `Here's the weather forecast for ${weather.location.name}:`,
            { weather, summary }
          );

          // Generate initial trek plan using free AI (Groq)
          try {
            const plan = await generateTrekPlan({
              destination: userMessage,
              weather,
              summary,
            });
            addMessage("assistant", plan);
          } catch (e) {
            console.error("AI plan error:", e);
            addMessage(
              "assistant",
              "I couldn't generate the trek plan right now. You can still ask questions about your trek."
            );
          }

          // Move to chat phase for follow-up questions
          setTimeout(() => {
            addMessage(
              "assistant",
              "Ask me follow-up questions or request adjustments (distance, pace, budget). 🏔️"
            );
            setPhase("chat");
          }, 200);
        } else if (result.suggestions && result.suggestions.length > 0) {
          const suggestionsMsg =
            `I found multiple locations:\n\n` +
            result.suggestions
              .map((s, i) => `${i + 1}. ${s.name}, ${s.admin1 || ""} ${s.country}`)
              .join("\n") +
            `\n\nPlease specify which one.`;
          addMessage("assistant", suggestionsMsg);
        } else {
          addMessage(
            "assistant",
            result.error || "Sorry, I couldn't find that location. Please try again."
          );
        }
      } else {
        // Chat phase - use AI with existing weather context
        if (!weatherContext) {
          addMessage(
            "assistant",
            "Please provide a destination first so I can tailor advice."
          );
        } else {
          try {
            const reply = await generateTrekPlan({
              destination,
              weather: weatherContext.weather,
              summary: weatherContext.summary,
              userQuestion: userMessage,
            });
            addMessage("assistant", reply);
          } catch (e) {
            console.error("AI follow-up error:", e);
            addMessage(
              "assistant",
              "I couldn't process that question right now. Please try again."
            );
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${!isOpen ? "bottom-5 right-5" : "bottom-3 right-3"} z-50 flexCenter ${!isOpen ? "h-16 w-16" : "h-8 w-8"} rounded-full border border-green-50 bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95`}
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="red"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="green"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        )}

        {/* Notification badge */}
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 flexCenter h-5 w-5 rounded-full bg-orange-50 text-white text-xs font-bold">
            {messages.length - 1}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={chatPanelRef}
          className="fixed bottom-12 right-5 z-40 w-[580px] max-w-[90vw] h-[650px] bg-white rounded-3xl shadow-2xl border border-gray-20 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-green-50 px-6 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flexCenter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="bold-16 text-white">TrekMate AI</h3>
              <p className="regular-14 text-white/80">
                {phase === "askDestination" ? "Weather & Trek Assistant" : "Ready to help"}
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 py-6 px-3 overflow-y-auto bg-gray-10">
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={message.role === "user" ? "max-w-[350px]" : "flex-1 max-w-[350px]"}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        message.role === "user"
                          ? "bg-green-50 text-white rounded-tr-sm ml-auto text-right inline-block"
                          : "bg-white text-gray-90 rounded-tl-sm"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <MarkdownMessage content={message.content} />
                      ) : (
                        <p className="regular-14 whitespace-pre-line">{message.content}</p>
                      )}
                    </div>
                    {/* Weather Card */}
                    {message.weatherData && (
                      <WeatherCard
                        weather={message.weatherData.weather}
                        summary={message.weatherData.summary}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-50 flexCenter flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="white"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 animate-pulse"
                    >
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-30 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-30 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-30 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t border-gray-20">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-20 rounded-full regular-14 focus:outline-none focus:border-green-50 transition-colors disabled:bg-gray-10 disabled:cursor-not-allowed"
              />
              {/* Language selector */}
              {isSpeechSupported && (
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value)}
                  disabled={isLoading || isListening}
                  aria-label="Speech language"
                  className="h-12 px-3 border border-gray-20 rounded-full regular-14 bg-white text-gray-90 focus:outline-none focus:border-green-50"
                >
                  <option value="en-US">EN</option>
                  <option value="ja-JP">日本語</option>
                </select>
              )}
              {/* Mic toggle */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`h-12 w-12 rounded-full flexCenter transition-colors ${
                    isListening ? "bg-red-500 hover:bg-red-600" : "bg-gray-20 hover:bg-gray-30"
                  }`}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                      <path d="M6 6h12v12H6z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="#111">
                      <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a5 5 0 11-10 0H5a7 7 0 0014 0h-2zM11 19h2v3h-2z" />
                    </svg>
                  )}
                </button>
              )}
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 rounded-full bg-green-50 flexCenter hover:bg-green-90 transition-colors disabled:bg-gray-20 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;