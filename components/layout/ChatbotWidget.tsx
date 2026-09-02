"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Send, X, Minimize2, Maximize2, Trash2, Sparkles, Bot, User } from "lucide-react";
import { Lottie } from "lottie-react";
import chatbotAnimation from "./chatbot.json";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hey there! 👋 I'm **Provia AI**, your personal guide to building a stunning portfolio.\n\nI can help you with **setting up your profile**, **connecting GitHub**, **choosing templates**, **publishing your portfolio**, and much more.\n\nWhat would you like to do today?",
  timestamp: new Date(),
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, scrollToBottom]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.success
          ? data.data.message
          : `⚠️ ${data.error || "I couldn't get a response. Please try again!"}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev.filter((m) => !m.isLoading), aiResponse]);
    } catch (err) {
      console.error("[ChatbotWidget] Fetch error:", err);
      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Oops! Something went wrong connecting to Provia AI. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const chatWidth = isExpanded ? "w-[480px]" : "w-[370px]";
  const chatHeight = isExpanded ? "h-[600px]" : "h-[520px]";

  const widget = (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`${chatWidth} ${chatHeight} bg-surface rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300`}
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent border-b border-border shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 ring-2 ring-brand/20">
              <Sparkles className="w-4 h-4 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary leading-tight">Provia AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[11px] text-text-muted font-medium">Online · Ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded((v) => !v)}
                className="p-1.5 hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                title={isExpanded ? "Compact" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "assistant"
                    ? "bg-brand/10 ring-1 ring-brand/20"
                    : "bg-surface-muted ring-1 ring-border"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="w-3.5 h-3.5 text-brand" />
                    : <User className="w-3.5 h-3.5 text-text-secondary" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand text-white rounded-tr-sm"
                      : "bg-surface-muted text-text-primary rounded-tl-sm border border-border"
                  }`}>
                    {msg.isLoading ? (
                      <div className="flex items-center gap-1.5 py-0.5 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : (
                      <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : ""}`} style={{ fontSize: "13px" }}>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className={`font-bold ${msg.role === "user" ? "text-white" : "text-text-primary"}`}>{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1.5">{children}</ul>,
                            li: ({ children }) => <li className="text-[13px]">{children}</li>,
                            code: ({ children }) => <code className="bg-black/10 rounded px-1 text-[12px] font-mono">{children}</code>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto overscroll-contain no-scrollbar shrink-0">
              {["How do I publish?", "Connect GitHub", "Change template"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInputValue(s); inputRef.current?.focus(); }}
                  className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-brand/8 text-brand border border-brand/20 hover:bg-brand/15 transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border bg-surface/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 bg-surface-muted rounded-xl px-3.5 py-2 border border-border focus-within:border-brand/40 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Provia..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none focus:outline-none focus:ring-0 border-none focus:border-transparent focus:shadow-none p-0 disabled:opacity-60"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center shrink-0 hover:bg-brand-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-text-muted mt-2 font-medium">Powered by Provia AI · Gemini</p>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div
        onClick={() => setIsOpen((v) => !v)}
        className="w-[76px] h-[76px] flex items-center justify-center cursor-pointer hover:scale-110 hover:-translate-y-1 transition-all duration-300 drop-shadow-2xl relative"
        title="Provia AI Assistant"
      >
        <div className="w-full h-full">
          <Lottie src={chatbotAnimation} loop autoplay />
        </div>
        {/* Notification badge */}
        {!isOpen && (
          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand rounded-full border-2 border-background animate-pulse shadow-sm" />
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(widget, document.body);
}
