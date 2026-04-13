import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  workoutSessions,
  workoutEntries,
  exercises,
} from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

function generateSessionMarkdown(
  session: {
    id: string;
    date: string;
    startedAt: string;
    endedAt: string | null;
    totalDurationMin: number | null;
    totalCalories: number | null;
    status: string | null;
    notes: string | null;
    aiEvaluation: string | null;
  },
  entries: {
    durationMin: number;
    sets: number | null;
    reps: number | null;
    weightKg: number | null;
    caloriesBurned: number | null;
    orderIndex: number;
    exercise: {
      nameJa: string | null;
      nameEn: string | null;
      category: string | null;
    } | null;
  }[]
): string {
  const categories = Array.from(
    new Set(entries.map((e) => e.exercise?.category).filter(Boolean))
  ) as string[];
  const tags = categories.map((c) => `#fitness/${c}`).join(" ");

  let md = `---
title: "ワークアウト ${session.date}"
date: ${session.date}
type: workout
status: ${session.status ?? "unknown"}
totalDurationMin: ${session.totalDurationMin ?? 0}
totalCalories: ${session.totalCalories ?? 0}
tags: [workout${categories.map((c) => `, ${c}`).join("")}]
---

# ワークアウト ${session.date}

- **開始**: ${session.startedAt}
- **終了**: ${session.endedAt ?? "未完了"}
- **合計時間**: ${session.totalDurationMin ?? 0}分
- **消費カロリー**: ${session.totalCalories ?? 0}kcal
- **ステータス**: ${session.status ?? "unknown"}
${tags}

## エクササイズ

| # | エクササイズ | カテゴリ | 時間(分) | セット | レップ | 重量(kg) | カロリー |
|---|------------|---------|---------|-------|-------|---------|---------|
`;

  for (const entry of entries) {
    const name = entry.exercise?.nameJa ?? "Unknown";
    const category = entry.exercise?.category ?? "-";
    md += `| ${entry.orderIndex + 1} | [[${name}]] | ${category} | ${entry.durationMin} | ${entry.sets ?? "-"} | ${entry.reps ?? "-"} | ${entry.weightKg ?? "-"} | ${entry.caloriesBurned ?? "-"} |\n`;
  }

  if (session.notes) {
    md += `\n## メモ\n\n${session.notes}\n`;
  }

  if (session.aiEvaluation) {
    md += `\n## AI評価\n\n${session.aiEvaluation}\n`;
  }

  return md;
}

function getSessionWithEntries(sessionId: string) {
  const session = db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, sessionId))
    .get();

  if (!session) return null;

  const entries = db
    .select({
      durationMin: workoutEntries.durationMin,
      sets: workoutEntries.sets,
      reps: workoutEntries.reps,
      weightKg: workoutEntries.weightKg,
      caloriesBurned: workoutEntries.caloriesBurned,
      orderIndex: workoutEntries.orderIndex,
      exercise: {
        nameJa: exercises.nameJa,
        nameEn: exercises.nameEn,
        category: exercises.category,
      },
    })
    .from(workoutEntries)
    .leftJoin(exercises, eq(workoutEntries.exerciseId, exercises.id))
    .where(eq(workoutEntries.sessionId, sessionId))
    .orderBy(workoutEntries.orderIndex)
    .all();

  return { session, entries };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, dateFrom, dateTo } = body;

    let markdown = "";

    if (sessionId) {
      // Export a single session
      const data = getSessionWithEntries(sessionId);

      if (!data) {
        return NextResponse.json(
          { error: "Workout session not found" },
          { status: 404 }
        );
      }

      markdown = generateSessionMarkdown(data.session, data.entries);
    } else if (dateFrom && dateTo) {
      // Export a range of sessions
      const sessions = db
        .select()
        .from(workoutSessions)
        .where(
          and(
            gte(workoutSessions.date, dateFrom),
            lte(workoutSessions.date, dateTo)
          )
        )
        .orderBy(desc(workoutSessions.date))
        .all();

      if (sessions.length === 0) {
        return NextResponse.json(
          { error: "No workout sessions found in the specified date range" },
          { status: 404 }
        );
      }

      const parts: string[] = [];
      for (const session of sessions) {
        const data = getSessionWithEntries(session.id);
        if (data) {
          parts.push(generateSessionMarkdown(data.session, data.entries));
        }
      }

      markdown = parts.join("\n---\n\n");
    } else {
      return NextResponse.json(
        { error: "Either sessionId or dateFrom/dateTo range is required" },
        { status: 400 }
      );
    }

    const filename = sessionId
      ? `workout-${sessionId}.md`
      : `workouts-${dateFrom}-to-${dateTo}.md`;

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to export workout data" },
      { status: 500 }
    );
  }
}
