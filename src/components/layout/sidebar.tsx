"use client";

import { cn } from "@/lib/utils/cn";
import {
  Home,
  Dumbbell,
  MessageCircle,
  BarChart3,
  User,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ダッシュボード", icon: Home },
  { href: "/workout", label: "ワークアウト", icon: Dumbbell },
  { href: "/chat", label: "AIチャット", icon: MessageCircle },
  { href: "/stats", label: "統計・グラフ", icon: BarChart3 },
  { href: "/profile", label: "プロフィール", icon: User },
  { href: "/coaches", label: "AIコーチ管理", icon: Users },
  { href: "/settings", label: "設定", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-700">
          <Dumbbell className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold">FitCoach AI</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
