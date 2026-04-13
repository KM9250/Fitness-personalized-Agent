import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workoutSessions } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    const now = new Date();
    let periodStart: Date;

    switch (period) {
      case "week":
        periodStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        break;
      case "month":
        periodStart = startOfMonth(subMonths(now, 1));
        break;
      case "year":
        periodStart = startOfYear(subYears(now, 1));
        break;
      default:
        periodStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    }

    const periodStartStr = periodStart.toISOString().split("T")[0];
    const nowStr = now.toISOString().split("T")[0];

    // Get completed sessions in period
    const sessions = db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.status, "completed"),
          gte(workoutSessions.date, periodStartStr),
          lte(workoutSessions.date, nowStr)
        )
      )
      .all();

    const totalCalories = sessions.reduce(
      (sum, s) => sum + (s.totalCalories ?? 0),
      0
    );

    const totalWorkouts = sessions.length;

    const totalDurationMin = sessions.reduce(
      (sum, s) => sum + (s.totalDurationMin ?? 0),
      0
    );

    // Build dailyCalories array
    const dailyMap: Record<string, number> = {};
    for (const session of sessions) {
      const date = session.date;
      dailyMap[date] = (dailyMap[date] ?? 0) + (session.totalCalories ?? 0);
    }

    const dailyCalories = Object.entries(dailyMap)
      .map(([date, calories]) => ({ date, calories }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalCalories: Math.round(totalCalories * 10) / 10,
      totalWorkouts,
      totalDurationMin,
      dailyCalories,
      period,
      periodStart: periodStartStr,
      periodEnd: nowStr,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
