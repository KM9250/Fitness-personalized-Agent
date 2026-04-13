"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import { CoachAvatar } from "@/components/coaches/coach-avatar";
import { Send, Bot, Loader2 } from "lucide-react";
import type { AICoach } from "@/types/llm";

export default function ChatPage() {
  const [coaches, setCoaches] = useState<AICoach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { coachId: selectedCoachId },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Fetch available coaches
  useEffect(() => {
    async function fetchCoaches() {
      try {
        const res = await fetch("/api/coaches");
        if (res.ok) {
          const data: AICoach[] = await res.json();
          setCoaches(data);
          const active = data.find((c) => c.isActive);
          if (active) {
            setSelectedCoachId(active.id);
          } else if (data.length > 0) {
            setSelectedCoachId(data[0].id);
          }
        }
      } catch (err) {
        console.error("コーチの取得に失敗しました:", err);
      }
    }
    fetchCoaches();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId);

  const coachOptions = coaches.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  function getMessageText(message: (typeof messages)[number]): string {
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage({ text });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 bg-white pb-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCoach ? (
              <CoachAvatar
                name={selectedCoach.name}
                avatarUrl={selectedCoach.avatarUrl}
                size="md"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCoach?.name || "AIコーチ"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCoach?.description || "コーチを選択してください"}
              </p>
            </div>
          </div>

          {/* Coach Selector */}
          {coachOptions.length > 0 && (
            <div className="w-40">
              <Select
                options={coachOptions}
                value={selectedCoachId}
                onChange={(e) => setSelectedCoachId(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-1 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                AIコーチにメッセージを送りましょう
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                トレーニングの相談、食事のアドバイス、モチベーションなど
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "user";
            const text = getMessageText(message);

            return (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                {!isUser &&
                  (selectedCoach ? (
                    <CoachAvatar
                      name={selectedCoach.name}
                      avatarUrl={selectedCoach.avatarUrl}
                      size="sm"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  ))}

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              {selectedCoach ? (
                <CoachAvatar
                  name={selectedCoach.name}
                  avatarUrl={selectedCoach.avatarUrl}
                  size="sm"
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="rounded-2xl bg-gray-100 px-4 py-2.5 dark:bg-gray-800">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-gray-200 bg-white pt-3 dark:border-gray-700 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="メッセージを入力..."
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
