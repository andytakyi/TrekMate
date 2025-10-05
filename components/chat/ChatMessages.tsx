"use client";

import { ChatMessage } from "@/lib/types/chat";
import MarkdownMessage from "@/components/MarkdownMessage";
import WeatherCard from "@/components/WeatherCard";
import React from "react";

type ChatMessagesProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  compact?: boolean;
  followUpSuggestions?: string[];
  onSuggestionClick?: (q: string) => void;
};

export default function ChatMessages({ messages, isLoading, messagesEndRef, compact = false, followUpSuggestions = [], onSuggestionClick }: ChatMessagesProps) {
  return (
    <div className="flex-1 py-6 px-3 overflow-y-auto bg-gray-10">
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={message.role === "user" ? (compact ? "max-w-[350px]" : "max-w-[520px]") : (compact ? "flex-1 max-w-[350px]" : "flex-1 max-w-[520px]")}>
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
              {message.weatherData && (
                <WeatherCard weather={message.weatherData.weather} summary={message.weatherData.summary} />
              )}
            </div>
          </div>
        ))}

        {/* Follow-up suggestions under the last AI message */}
        {followUpSuggestions.length > 0 && (
          <div className="flex gap-2 flex-wrap items-start">
            {followUpSuggestions.map((s, i) => (
              <button
                key={`${s}-${i}`}
                type="button"
                onClick={() => onSuggestionClick && onSuggestionClick(s)}
                className="text-xs sm:text-sm px-3 py-2 rounded-full border border-gray-20 bg-white hover:bg-gray-10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-green-50 flexCenter flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-5 h-5 animate-pulse">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}


