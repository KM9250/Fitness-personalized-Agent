"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { StatCard } from "@/components/stats/stat-card";
import { CaloriesChart } from "@/components/stats/calories-chart";
import { WeightChart } from "@/components/stats/weight-chart";
import { WorkoutFrequencyChart } from "@/components/stats/workout-frequency-chart";
import { Flame, Scale, Activity, Dumbbell } from "lucide-react";

const periodTabs = [
  { id: "week", label: "週間" },
  { id: "month", label: "月間" },
  { id: "year", label: "年間" },
];

interface StatsData {
  totalCalories: number;
  totalWorkouts: number;
  totalDurationMin: number;
  dailyCalories: { date: string; calories: number }[];
}

interface WeightData {
  date: string;
  weightKg: number;
}

export default function StatsPage() {
  const [period, setPeriod] = useState<string>("week");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, weightRes] = await Promise.all([
          fetch(`/api/stats?period=${period}`),
          fetch("/api/weight"),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (weightRes.ok) {
          const weights = await weightRes.json();
          setWeightData(
            weights.map((w: WeightData) => ({
              date: w.date,
              weightKg: w.weightKg,
            }))
          );
        }
      } catch {
        console.error("統計データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  const frequencyData =
    stats?.dailyCalories.map((d) => ({
      date: d.date,
      count: d.calories > 0 ? 1 : 0,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          統計・グラフ
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          トレーニングの進捗を確認
        </p>
      </div>

      <Tabs tabs={periodTabs} activeTab={period} onTabChange={setPeriod} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          title="消費カロリー"
          value={Math.round(stats?.totalCalories ?? 0)}
          unit="kcal"
          icon={Flame}
          color="orange"
        />
        <StatCard
          title="ワークアウト数"
          value={stats?.totalWorkouts ?? 0}
          unit="回"
          icon={Dumbbell}
          color="blue"
        />
        <StatCard
          title="合計時間"
          value={stats?.totalDurationMin ?? 0}
          unit="分"
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="現在の体重"
          value={weightData.length > 0 ? weightData[0].weightKg : "-"}
          unit={weightData.length > 0 ? "kg" : ""}
          icon={Scale}
          color="green"
        />
      </div>

      {/* Calories Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle>消費カロリー</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <CaloriesChart data={stats?.dailyCalories ?? []} />
          )}
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Scale className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>体重推移</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <WeightChart data={weightData} />
          )}
        </CardContent>
      </Card>

      {/* Workout Frequency Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>ワークアウト頻度</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <WorkoutFrequencyChart data={frequencyData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
