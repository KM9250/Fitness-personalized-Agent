"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Dumbbell, Clock, Zap, Check } from "lucide-react";
import type { Exercise, ExerciseCategory } from "@/types/exercise";
import { CATEGORY_LABELS } from "@/types/exercise";

const categoryTabs = [
  { id: "all", label: "全て" },
  { id: "strength", label: "筋トレ" },
  { id: "cardio", label: "有酸素" },
  { id: "yoga", label: "ヨガ" },
  { id: "stretching", label: "ストレッチ" },
  { id: "hiit", label: "HIIT" },
];

export default function WorkoutPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set()
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  async function startSession() {
    if (selectedExercises.size === 0 || starting) return;
    setStarting(true);
    try {
      const payload = {
        exercises: Array.from(selectedExercises).map((exerciseId) => {
          const ex = exercises.find((e) => e.id === exerciseId);
          return {
            exerciseId,
            durationMin: ex?.defaultDurationMin ?? 10,
          };
        }),
      };
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const session = await res.json();
        router.push(`/workout/${session.id}`);
      } else {
        console.error("セッションの作成に失敗しました");
        setStarting(false);
      }
    } catch (err) {
      console.error("セッションの作成に失敗しました:", err);
      setStarting(false);
    }
  }

  useEffect(() => {
    async function fetchExercises() {
      try {
        const res = await fetch("/api/exercises");
        if (res.ok) {
          const data = await res.json();
          setExercises(data);
        }
      } catch (err) {
        console.error("エクササイズの取得に失敗しました:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExercises();
  }, []);

  const filteredExercises =
    selectedCategory === "all"
      ? exercises
      : exercises.filter((e) => e.category === selectedCategory);

  function toggleExercise(id: string) {
    setSelectedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ワークアウト
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          エクササイズを選択してセッションを開始
        </p>
      </div>

      {/* Category Filter */}
      <Tabs
        tabs={categoryTabs}
        activeTab={selectedCategory}
        onTabChange={setSelectedCategory}
      />

      {/* Exercise Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="py-12 text-center">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            エクササイズが見つかりません
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExercises.has(exercise.id);
            return (
              <Card
                key={exercise.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-400 dark:bg-blue-950/30 dark:ring-blue-400"
                    : "hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => toggleExercise(exercise.id)}
              >
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {exercise.nameJa}
                        </h3>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          exercise.category as ExerciseCategory
                        }
                      >
                        {CATEGORY_LABELS[exercise.category]?.ja ||
                          exercise.category}
                      </Badge>
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          MET {exercise.metValue}
                        </span>
                        {exercise.defaultDurationMin && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exercise.defaultDurationMin}分
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Start Session Button */}
      {selectedExercises.size > 0 && (
        <div className="sticky bottom-20 z-10 md:bottom-4">
          <Button
            size="lg"
            className="w-full shadow-lg"
            onClick={startSession}
            disabled={starting}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            {starting
              ? "セッションを作成中..."
              : `セッションを開始（${selectedExercises.size}種目）`}
          </Button>
        </div>
      )}
    </div>
  );
}
