"use client";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChat } from "./useChat";

type ChatPanelProps = {
  compact?: boolean;
};

export default function ChatPanel({ compact = false }: ChatPanelProps) {
  const {
    messages,
    input,
    phase,
    isLoading,
    isListening,
    speechLang,
    messagesEndRef,
    inputRef,
    setInput,
    send,
    getPlaceholder,
    isSpeechSupported,
    toggleListening,
    setSpeechLang,
    followUpSuggestions,
  } = useChat();

  return (
    <div className="bg-white overflow-hidden flex flex-col h-full">
      <ChatHeader
        title="TrekMate AI"
        subtitle={phase === "askDestination" ? "Weather & Trek Assistant" : "Ready to help"}
      />
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        compact={compact}
        followUpSuggestions={followUpSuggestions}
        onSuggestionClick={(q) => send(q)}
      />
      <ChatInput
        input={input}
        setInput={setInput}
        placeholder={getPlaceholder()}
        disabled={isLoading}
        isSpeechSupported={isSpeechSupported}
        isListening={isListening}
        speechLang={speechLang}
        setSpeechLang={setSpeechLang}
        toggleListening={toggleListening}
        onSend={send}
        inputRef={inputRef}
      />
    </div>
  );
}


