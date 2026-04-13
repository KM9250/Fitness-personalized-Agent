import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Dumbbell, Scale, ArrowRight, TrendingUp } from "lucide-react";


function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "おはようございます";
  if (hour < 18) return "こんにちは";
  return "こんばんは";
}

// Placeholder data for recent workouts
const recentWorkouts = [
  {
    id: "1",
    date: "2026-04-11",
    name: "上半身トレーニング",
    duration: 45,
    calories: 320,
    exercises: 5,
  },
  {
    id: "2",
    date: "2026-04-09",
    name: "ランニング + ストレッチ",
    duration: 35,
    calories: 280,
    exercises: 3,
  },
  {
    id: "3",
    date: "2026-04-07",
    name: "全身HIIT",
    duration: 25,
    calories: 410,
    exercises: 8,
  },
];

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          今日もトレーニングを頑張りましょう
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                今日の消費カロリー
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                0 <span className="text-sm font-normal text-gray-400">kcal</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                今週のワークアウト数
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                3 <span className="text-sm font-normal text-gray-400">回</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Scale className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                現在の体重
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                70.0 <span className="text-sm font-normal text-gray-400">kg</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Link href="/workout">
        <Card className="group cursor-pointer border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 transition-shadow hover:shadow-md dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ワークアウトを開始
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  エクササイズを選んでトレーニング
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
          </CardContent>
        </Card>
      </Link>

      {/* Recent Workouts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            最近のワークアウト
          </h2>
          <Link
            href="/workout/history"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            すべて表示
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentWorkouts.map((workout) => (
            <Card key={workout.id}>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {workout.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {workout.date} ・ {workout.exercises}種目 ・ {workout.duration}分
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    {workout.calories}
                  </p>
                  <p className="text-xs text-gray-400">kcal</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
