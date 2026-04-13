"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Timer,
  Dumbbell,
} from "lucide-react";

interface ExerciseEntry {
  id: string;
  nameJa: string;
  category: string;
  sets: number;
  reps: number;
  weightKg: number;
  durationMin: number;
  completed: boolean;
}

// Placeholder exercises for the session
const placeholderExercises: ExerciseEntry[] = [
  {
    id: "1",
    nameJa: "ベンチプレス",
    category: "strength",
    sets: 3,
    reps: 10,
    weightKg: 60,
    durationMin: 0,
    completed: false,
  },
  {
    id: "2",
    nameJa: "スクワット",
    category: "strength",
    sets: 3,
    reps: 12,
    weightKg: 80,
    durationMin: 0,
    completed: false,
  },
  {
    id: "3",
    nameJa: "ランニング",
    category: "cardio",
    sets: 0,
    reps: 0,
    weightKg: 0,
    durationMin: 20,
    completed: false,
  },
  {
    id: "4",
    nameJa: "ヨガ・太陽礼拝",
    category: "yoga",
    sets: 0,
    reps: 0,
    weightKg: 0,
    durationMin: 15,
    completed: false,
  },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function ActiveWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  void (params.id as string);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(
    placeholderExercises
  );

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const currentExercise = exercises[currentIndex];
  const isStrength = currentExercise?.category === "strength";
  const completedCount = exercises.filter((e) => e.completed).length;

  const updateExercise = useCallback(
    (field: keyof ExerciseEntry, value: number) => {
      setExercises((prev) =>
        prev.map((e, i) => (i === currentIndex ? { ...e, [field]: value } : e))
      );
    },
    [currentIndex]
  );

  function completeCurrentExercise() {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === currentIndex ? { ...e, completed: true } : e
      )
    );
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function nextExercise() {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function finishWorkout() {
    setIsRunning(false);
    // In production, this would save to the API
    router.push("/workout/history");
  }

  if (!currentExercise) return null;

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
            {completedCount}/{exercises.length} 種目完了
          </p>
        </CardContent>
      </Card>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {exercises.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-3 w-3 rounded-full transition-all ${
              i === currentIndex
                ? "scale-125 bg-blue-600 dark:bg-blue-400"
                : ex.completed
                ? "bg-green-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            title={ex.nameJa}
          />
        ))}
      </div>

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>{currentExercise.nameJa}</CardTitle>
            {currentExercise.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1}/{exercises.length} 種目目
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
                  value={currentExercise.sets}
                  onChange={(e) =>
                    updateExercise("sets", parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  label="レップ数"
                  type="number"
                  min={1}
                  value={currentExercise.reps}
                  onChange={(e) =>
                    updateExercise("reps", parseInt(e.target.value) || 0)
                  }
                />
                <Input
                  label="重量 (kg)"
                  type="number"
                  min={0}
                  step={2.5}
                  value={currentExercise.weightKg}
                  onChange={(e) =>
                    updateExercise(
                      "weightKg",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="実施時間（分）"
                type="number"
                min={1}
                value={currentExercise.durationMin}
                onChange={(e) =>
                  updateExercise(
                    "durationMin",
                    parseInt(e.target.value) || 0
                  )
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={120}
                  value={currentExercise.durationMin}
                  onChange={(e) =>
                    updateExercise("durationMin", parseInt(e.target.value))
                  }
                  className="w-full accent-blue-600"
                />
                <span className="w-12 text-right text-sm text-gray-500 dark:text-gray-400">
                  {currentExercise.durationMin}分
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!currentExercise.completed && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={completeCurrentExercise}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            完了
          </Button>
        )}
        {currentIndex < exercises.length - 1 && (
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
      >
        ワークアウト完了
      </Button>
    </div>
  );
}
