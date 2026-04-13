"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CaloriesChartProps {
  data: { date: string; calories: number }[];
}

export function CaloriesChart({ data }: CaloriesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v: number) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "none",
            borderRadius: "8px",
            color: "#f3f4f6",
            fontSize: 12,
          }}
          formatter={(value) => [`${Math.round(Number(value))} kcal`, "カロリー"]}
          labelFormatter={(label) => {
            const d = new Date(label);
            return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
