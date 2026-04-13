"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  ChevronRight,
  History,
} from "lucide-react";

import type { WorkoutSession } from "@/types/workout";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  completed: {
    label: "完了",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  in_progress: {
    label: "進行中",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  cancelled: {
    label: "キャンセル",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  },
};

interface WorkoutHistoryItem extends WorkoutSession {
  exerciseCount?: number;
}

export default function WorkoutHistoryPage() {
  const [sessions, setSessions] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/workout");
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (err) {
        console.error("ワークアウト履歴の取得に失敗しました:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  }

  function formatDuration(minutes: number | null): string {
    if (!minutes) return "--";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}時間${m}分`;
    return `${m}分`;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ワークアウト履歴
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          過去のトレーニング記録を確認
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!loading && sessions.length === 0 && (
        <div className="py-16 text-center">
          <History className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            ワークアウト履歴がありません
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            最初のワークアウトを開始しましょう
          </p>
          <Link
            href="/workout"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <Dumbbell className="h-4 w-4" />
            ワークアウトを開始
          </Link>
        </div>
      )}

      {/* Session List */}
      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => {
            const statusInfo =
              STATUS_LABELS[session.status || "completed"] ||
              STATUS_LABELS.completed;

            return (
              <Link key={session.id} href={`/workout/${session.id}`}>
                <Card className="transition-colors hover:border-gray-300 dark:hover:border-gray-600">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Date & Status */}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(session.date)}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(session.totalDurationMin)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            {session.totalCalories
                              ? `${Math.round(session.totalCalories)} kcal`
                              : "-- kcal"}
                          </span>
                          {session.exerciseCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Dumbbell className="h-3.5 w-3.5" />
                              {session.exerciseCount}種目
                            </span>
                          )}
                        </div>

                        {/* Notes */}
                        {session.notes && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
                            {session.notes}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
