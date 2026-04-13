import type { WorkoutSessionWithEntries } from "@/types/workout";
import { workoutToMarkdown } from "./markdown";

export function generateObsidianExport(
  sessions: WorkoutSessionWithEntries[]
): { filename: string; content: string }[] {
  return sessions.map((session) => ({
    filename: `daily/${session.date}-workout.md`,
    content: workoutToMarkdown(session),
  }));
}

export function generateWeeklySummary(
  sessions: WorkoutSessionWithEntries[],
  weekLabel: string
): { filename: string; content: string } {
  const totalCalories = sessions.reduce(
    (sum, s) => sum + (s.totalCalories || 0),
    0
  );
  const totalDuration = sessions.reduce(
    (sum, s) => sum + (s.totalDurationMin || 0),
    0
  );
  const totalWorkouts = sessions.length;

  const content = [
    "---",
    `type: weekly-summary`,
    `week: ${weekLabel}`,
    `total_workouts: ${totalWorkouts}`,
    `total_duration_min: ${totalDuration}`,
    `total_calories: ${totalCalories}`,
    `tags:`,
    `  - fitness`,
    `  - weekly-summary`,
    "---",
    "",
    `# 週間サマリー ${weekLabel}`,
    "",
    `## 概要`,
    `- ワークアウト数: ${totalWorkouts}回`,
    `- 合計時間: ${totalDuration}分`,
    `- 合計カロリー: ${Math.round(totalCalories)} kcal`,
    "",
    `## セッション一覧`,
    ...sessions.map(
      (s) =>
        `- [[${s.date}-workout|${s.date}]] - ${s.totalDurationMin || 0}分 / ${Math.round(s.totalCalories || 0)} kcal`
    ),
    "",
  ].join("\n");

  return {
    filename: `weekly/${weekLabel}-summary.md`,
    content,
  };
}
