"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoachAvatar } from "@/components/coaches/coach-avatar";
import {
  Plus,
  Edit2,
  Power,
  PowerOff,
  Bot,
  Cpu,
  Loader2,
} from "lucide-react";
import type { AICoach } from "@/types/llm";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<AICoach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  async function fetchCoaches() {
    try {
      const res = await fetch("/api/coaches");
      if (res.ok) {
        const data: AICoach[] = await res.json();
        setCoaches(data);
      }
    } catch (err) {
      console.error("コーチの取得に失敗しました:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(coach: AICoach) {
    try {
      const res = await fetch(`/api/coaches/${coach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coach.isActive }),
      });
      if (res.ok) {
        setCoaches((prev) =>
          prev.map((c) =>
            c.id === coach.id ? { ...c, isActive: !c.isActive } : c
          )
        );
      }
    } catch (err) {
      console.error("コーチの更新に失敗しました:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AIコーチ管理
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            AIコーチの設定・管理
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          コーチを追加
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && coaches.length === 0 && (
        <div className="py-16 text-center">
          <Bot className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            コーチが登録されていません
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            AIコーチを追加して、トレーニングのサポートを受けましょう
          </p>
        </div>
      )}

      {/* Coach Grid */}
      {!loading && coaches.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <Card
              key={coach.id}
              className={`relative transition-all ${
                coach.isActive
                  ? "border-blue-300 ring-1 ring-blue-200 dark:border-blue-600 dark:ring-blue-800"
                  : ""
              }`}
            >
              <CardContent className="space-y-4">
                {/* Active Badge */}
                {coach.isActive && (
                  <div className="absolute right-3 top-3">
                    <Badge>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                      アクティブ
                    </Badge>
                  </div>
                )}

                {/* Avatar & Name */}
                <div className="flex items-center gap-3">
                  <CoachAvatar
                    name={coach.name}
                    avatarUrl={coach.avatarUrl}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                      {coach.name}
                    </h3>
                    {coach.description && (
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                        {coach.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Provider & Model */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>
                    {coach.llmProvider || "未設定"} / {coach.llmModel || "未設定"}
                  </span>
                </div>

                {/* Preset Badge */}
                {coach.isPreset && (
                  <Badge>プリセット</Badge>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit2 className="mr-1 h-3.5 w-3.5" />
                    編集
                  </Button>
                  <Button
                    variant={coach.isActive ? "ghost" : "secondary"}
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleActive(coach)}
                  >
                    {coach.isActive ? (
                      <>
                        <PowerOff className="mr-1 h-3.5 w-3.5" />
                        無効化
                      </>
                    ) : (
                      <>
                        <Power className="mr-1 h-3.5 w-3.5" />
                        有効化
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
