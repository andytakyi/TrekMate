"use client";

import React, { useState } from "react";
import Image from "next/image";

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flexCenter h-16 w-16 rounded-full border border-green-50 bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
        aria-label="Open chat"
      >
        {isOpen ? (
          // Close icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="green"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Chat bubble icon
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

        {/* Notification badge (optional - for unread messages) */}
        <span className="absolute -top-1 -right-1 flexCenter h-5 w-5 rounded-full bg-orange-50 text-white text-xs font-bold">
          1
        </span>
      </button>

      {/* Chat Panel - placeholder for now */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-[580px] max-w-[90vw] h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-20 overflow-hidden flex flex-col">
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
              <p className="regular-14 text-white/80">Plan your trek</p>
            </div>
          </div>

          {/* Messages area - placeholder */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-10">
            <div className="flex flex-col gap-4">
              {/* AI message */}
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-green-50 flexCenter flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[260px]">
                  <p className="regular-14 text-gray-90">
                    Hi! I'm TrekMate AI. Where do you want to trek in Japan? 🏔️
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Input area - placeholder */}
          <div className="p-4  bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter trekking location..."
                className="flex-1 px-4 py-3 border border-gray-20 rounded-full regular-14 focus:outline-none focus:border-green-50 transition-colors"
              />
              <button
                className="h-12 w-12 rounded-full bg-green-50 flexCenter hover:bg-green-90 transition-colors"
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
