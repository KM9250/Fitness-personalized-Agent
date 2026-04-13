"use client";

import { Dumbbell, Settings } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-blue-600" />
        <span className="text-lg font-bold">FitCoach AI</span>
      </Link>
      <Link
        href="/settings"
        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </header>
  );
}
