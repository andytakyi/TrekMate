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
  inputRef: React.RefObject<HTMLInputElement>;
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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-w-0 px-4 py-3 border border-gray-20 rounded-full regular-14 focus:outline-none focus:border-green-50 transition-colors disabled:bg-gray-10 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">

            {isSpeechSupported && (
              <div
                role="group"
                aria-label="Speech language"
                className="shrink-0 inline-flex items-center h-10 sm:h-12 rounded-full border border-gray-20 overflow-hidden bg-white"
              >
                <button
                  type="button"
                  onClick={() => setSpeechLang("en-US")}
                  disabled={disabled || isListening}
                  className={`px-3 sm:px-4 h-full text-xs sm:text-sm font-medium transition-colors ${speechLang === "en-US" ? "bg-green-50 text-white" : "text-gray-90"
                    }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLang("ja-JP")}
                  disabled={disabled || isListening}
                  className={`px-3 sm:px-4 h-full text-xs sm:text-sm font-medium transition-colors ${speechLang === "ja-JP" ? "bg-green-50 text-white" : "text-gray-90"
                    }`}
                >
                  JA
                </button>
              </div>
            )}
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={disabled}
                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flexCenter transition-colors shrink-0 ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-gray-20 hover:bg-gray-30"
                  }`}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                title={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="white">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="#111">
                    <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a5 5 0 11-10 0H5a7 7 0 0014 0h-2zM11 19h2v3h-2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <button
            onClick={onSend}
            disabled={disabled || !input.trim()}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-50 flexCenter hover:bg-green-90 transition-colors disabled:bg-gray-20 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


