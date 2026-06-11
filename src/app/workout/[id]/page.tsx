"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoachAvatar } from "@/components/coaches/coach-avatar";
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Timer,
  Dumbbell,
  Loader2,
} from "lucide-react";
import type { AICoach } from "@/types/llm";

interface SessionEntry {
  id: string;
  exerciseId: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  durationMin: number;
  caloriesBurned: number | null;
  orderIndex: number;
  exercise: {
    nameJa: string;
    nameEn: string;
    category: string;
    metValue: number;
  } | null;
}

interface EditableEntry extends SessionEntry {
  completed: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function ActiveWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Spontaneous coach messages
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  const [activeCoach, setActiveCoach] = useState<AICoach | null>(null);
  const spontaneousConfig = useRef<{ enabled: boolean; intervalMin: number }>({
    enabled: false,
    intervalMin: 3,
  });
  const entriesRef = useRef<EditableEntry[]>([]);
  const currentIndexRef = useRef(0);
  const elapsedRef = useRef(0);

  entriesRef.current = entries;
  currentIndexRef.current = currentIndex;
  elapsedRef.current = elapsedSeconds;

  // Load session data
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/workout/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(
            (data.entries as SessionEntry[]).map((e) => ({
              ...e,
              sets: e.sets ?? (e.exercise?.category === "strength" ? 3 : null),
              reps: e.reps ?? (e.exercise?.category === "strength" ? 10 : null),
              weightKg:
                e.weightKg ?? (e.exercise?.category === "strength" ? 20 : null),
              completed: false,
            }))
          );
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  // Load spontaneous message settings and active coach
  useEffect(() => {
    async function fetchConfig() {
      try {
        const [settingsRes, coachesRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/coaches"),
        ]);
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          spontaneousConfig.current = {
            enabled: settings.spontaneous_enabled === "true",
            intervalMin: parseInt(settings.spontaneous_interval_min) || 3,
          };
        }
        if (coachesRes.ok) {
          const coaches: AICoach[] = await coachesRes.json();
          setActiveCoach(coaches.find((c) => c.isActive) ?? coaches[0] ?? null);
        }
      } catch {
        // Spontaneous messages are optional; ignore failures
      }
    }
    fetchConfig();
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Spontaneous coach messages during workout
  useEffect(() => {
    if (!isRunning) return;
    const intervalMs = spontaneousConfig.current.intervalMin * 60 * 1000;
    const interval = setInterval(async () => {
      if (!spontaneousConfig.current.enabled) return;
      const current = entriesRef.current[currentIndexRef.current];
      if (!current) return;
      try {
        const res = await fetch("/api/chat/spontaneous", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentExercise: current.exercise?.nameJa ?? current.exerciseId,
            elapsedTime: Math.floor(elapsedRef.current / 60),
            remainingExercises: entriesRef.current
              .filter((e) => !e.completed)
              .map((e) => e.exercise?.nameJa ?? e.exerciseId),
            coachId: activeCoach?.id,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setCoachMessage(data.message);
          // Auto-hide after 30 seconds
          setTimeout(() => setCoachMessage(null), 30000);
        }
      } catch {
        // Ignore failures silently during workout
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isRunning, activeCoach]);

  const currentEntry = entries[currentIndex];
  const isStrength = currentEntry?.exercise?.category === "strength";
  const completedCount = entries.filter((e) => e.completed).length;

  const updateEntry = useCallback(
    (field: "sets" | "reps" | "weightKg" | "durationMin", value: number) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === currentIndex ? { ...e, [field]: value } : e))
      );
    },
    [currentIndex]
  );

  function completeCurrentExercise() {
    setEntries((prev) =>
      prev.map((e, i) => (i === currentIndex ? { ...e, completed: true } : e))
    );
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function nextExercise() {
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  async function finishWorkout() {
    if (finishing) return;
    setFinishing(true);
    setIsRunning(false);
    try {
      const res = await fetch(`/api/workout/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          endedAt: new Date().toISOString(),
          entries: entries.map((e) => ({
            id: e.id,
            sets: e.sets,
            reps: e.reps,
            weightKg: e.weightKg,
            durationMin: e.durationMin,
          })),
        }),
      });
      if (res.ok) {
        router.push("/workout/history");
      } else {
        console.error("ワークアウトの保存に失敗しました");
        setFinishing(false);
      }
    } catch (err) {
      console.error("ワークアウトの保存に失敗しました:", err);
      setFinishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (loadError || !currentEntry) {
    return (
      <div className="py-20 text-center">
        <Dumbbell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          セッションが見つかりません
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/workout")}
        >
          ワークアウト選択に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-700">
        <CardContent className="text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <Timer className="h-5 w-5" />
            <span className="text-sm font-medium">経過時間</span>
          </div>
          <p className="text-4xl font-bold tabular-nums">
            {formatTime(elapsedSeconds)}
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              className="text-gray-900"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-1 h-4 w-4" /> 一時停止
                </>
              ) : (
                <>
                  <Play className="mr-1 h-4 w-4" /> 再開
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-sm text-blue-100">
            {completedCount}/{entries.length} 種目完了
          </p>
        </CardContent>
      </Card>

      {/* Spontaneous Coach Message */}
      {coachMessage && activeCoach && (
        <div className="flex items-start gap-2">
          <CoachAvatar
            name={activeCoach.name}
            avatarUrl={activeCoach.avatarUrl}
            size="sm"
            className="mt-1"
          />
          <div className="max-w-[85%] rounded-2xl bg-blue-50 px-4 py-2.5 text-sm leading-relaxed text-gray-900 dark:bg-blue-950/40 dark:text-gray-100">
            <p className="whitespace-pre-wrap">{coachMessage}</p>
          </div>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {entries.map((entry, i) => (
          <button
            key={entry.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-3 w-3 rounded-full transition-all ${
              i === currentIndex
                ? "scale-125 bg-blue-600 dark:bg-blue-400"
                : entry.completed
                ? "bg-green-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            title={entry.exercise?.nameJa ?? entry.exerciseId}
          />
        ))}
      </div>

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>
              {currentEntry.exercise?.nameJa ?? currentEntry.exerciseId}
            </CardTitle>
            {currentEntry.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1}/{entries.length} 種目目
          </p>
        </CardHeader>
        <CardContent>
          {isStrength ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="セット数"
                  type="number"
                  min={1}
                  value={currentEntry.sets ?? 3}
                  onChange={(e) =>
                    updateEntry("sets", parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  label="レップ数"
                  type="number"
                  min={1}
                  value={currentEntry.reps ?? 10}
                  onChange={(e) =>
                    updateEntry("reps", parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  label="重量 (kg)"
                  type="number"
                  min={0}
                  step={2.5}
                  value={currentEntry.weightKg ?? 0}
                  onChange={(e) =>
                    updateEntry("weightKg", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <Input
                label="実施時間（分）"
                type="number"
                min={1}
                value={currentEntry.durationMin}
                onChange={(e) =>
                  updateEntry("durationMin", parseInt(e.target.value) || 0)
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="実施時間（分）"
                type="number"
                min={1}
                value={currentEntry.durationMin}
                onChange={(e) =>
                  updateEntry("durationMin", parseInt(e.target.value) || 0)
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={120}
                  value={currentEntry.durationMin}
                  onChange={(e) =>
                    updateEntry("durationMin", parseInt(e.target.value))
                  }
                  className="w-full accent-blue-600"
                />
                <span className="w-12 text-right text-sm text-gray-500 dark:text-gray-400">
                  {currentEntry.durationMin}分
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!currentEntry.completed && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={completeCurrentExercise}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            完了
          </Button>
        )}
        {currentIndex < entries.length - 1 && (
          <Button variant="outline" className="flex-1" onClick={nextExercise}>
            <SkipForward className="mr-2 h-4 w-4" />
            次の種目
          </Button>
        )}
      </div>

      {/* Finish Workout */}
      <Button
        variant="danger"
        size="lg"
        className="w-full"
        onClick={finishWorkout}
        disabled={finishing}
      >
        {finishing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : (
          "ワークアウト完了"
        )}
      </Button>
    </div>
  );
}
