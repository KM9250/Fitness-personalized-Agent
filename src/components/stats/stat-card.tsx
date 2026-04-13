import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: "orange" | "green" | "blue" | "purple";
  change?: string;
}

const COLOR_MAP = {
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    icon: "text-orange-600 dark:text-orange-400",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    icon: "text-green-600 dark:text-green-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    icon: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    icon: "text-purple-600 dark:text-purple-400",
  },
};

export function StatCard({ title, value, unit, icon: Icon, color, change }: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <Card className="flex items-center gap-3 p-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          colors.bg
        )}
      >
        <Icon className={cn("h-5 w-5", colors.icon)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
          {unit && <span className="ml-0.5 text-sm font-normal text-gray-500">{unit}</span>}
        </p>
        {change && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{change}</p>
        )}
      </div>
    </Card>
  );
}
