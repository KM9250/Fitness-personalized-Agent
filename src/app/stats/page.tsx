"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Flame, Scale, Activity, BarChart3 } from "lucide-react";

const periodTabs = [
  { id: "week", label: "週間" },
  { id: "month", label: "月間" },
  { id: "year", label: "年間" },
];

export default function StatsPage() {
  const [period, setPeriod] = useState<string>("week");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          統計・グラフ
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          トレーニングの進捗を確認
        </p>
      </div>

      {/* Period Selector */}
      <Tabs tabs={periodTabs} activeTab={period} onTabChange={setPeriod} />

      {/* Chart: Calories Burned */}
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
          {/* TODO: Recharts will be integrated in Phase 4 */}
          <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                消費カロリーグラフ（{periodTabs.find((t) => t.id === period)?.label}）
              </p>
              <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
                Phase 4で Recharts を統合予定
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart: Weight Trend */}
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
          {/* TODO: Recharts will be integrated in Phase 4 */}
          <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                体重推移グラフ（{periodTabs.find((t) => t.id === period)?.label}）
              </p>
              <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
                Phase 4で Recharts を統合予定
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart: Workout Frequency */}
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
          {/* TODO: Recharts will be integrated in Phase 4 */}
          <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                ワークアウト頻度グラフ（{periodTabs.find((t) => t.id === period)?.label}）
              </p>
              <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
                Phase 4で Recharts を統合予定
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
