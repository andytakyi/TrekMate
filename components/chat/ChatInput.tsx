"use client";

type ChatInputProps = {
  input: string;
  setInput: (v: string) => void;
  placeholder: string;
  disabled: boolean;
  isSpeechSupported: boolean;
  isListening: boolean;
  speechLang: string;
  setSpeechLang: (v: string) => void;
  toggleListening: () => void;
  onSend: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
};

export default function ChatInput({
  input,
  setInput,
  placeholder,
  disabled,
  isSpeechSupported,
  isListening,
  speechLang,
  setSpeechLang,
  toggleListening,
  onSend,
  inputRef,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const autoSize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px"; // cap ~6 lines
  };

  // Keep textarea height in sync with content
  if (typeof window !== "undefined") {
    // Run after each render when input changes
    setTimeout(autoSize, 0);
  }

  return (
    <div className="p-2 bg-white border-t border-gray-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Input container */}
          <div className="flex-1 rounded-2xl border border-gray-10 bg-white shadow-sm px-3 py-1 flex items-center gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoSize();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 min-w-0 resize-none py-1 bg-transparent regular-14 leading-6 text-gray-90 placeholder-gray-30 focus:outline-none"
            />
          </div>

          {/* Send */}
          <button
            onClick={() => onSend()}
            disabled={disabled || !input.trim()}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-50 flexCenter hover:bg-green-90 transition-colors disabled:bg-gray-20 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
            title="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        {/* Voice */}
        {isSpeechSupported && (
          <div className="flex items-center gap-2 px-3">
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={disabled}
              className={`h-8 w-8 rounded-full flexCenter transition-colors shrink-0 ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-gray-10 hover:bg-gray-20"}`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="white">
                  <path d="M6 6h12v12H6z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="#141414">
                  <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a5 5 0 11-10 0H5a7 7 0 0014 0h-2zM11 19h2v3h-2z" />
                </svg>
              )}
            </button>
            {/* Language */}
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value)}
              disabled={disabled || isListening}
              aria-label="Voice language"
              className="regular-14 text-xs border border-gray-10 rounded-full bg-gray-10 text-gray-90 px-3 py-1"
            >
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}


