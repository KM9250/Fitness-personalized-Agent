import type { WorkoutSessionWithEntries } from "@/types/workout";

export function workoutToMarkdown(
  session: WorkoutSessionWithEntries
): string {
  const exercisesYaml = session.entries.map((e) => {
    const parts: string[] = [
      `    - name: ${e.exercise?.nameJa || e.exerciseId}`,
      `      duration_min: ${e.durationMin}`,
    ];
    if (e.sets) parts.push(`      sets: ${e.sets}`);
    if (e.reps) parts.push(`      reps: ${e.reps}`);
    if (e.weightKg) parts.push(`      weight_kg: ${e.weightKg}`);
    if (e.caloriesBurned) parts.push(`      calories: ${e.caloriesBurned}`);
    return parts.join("\n");
  });

  const categories = Array.from(
    new Set(session.entries.map((e) => e.exercise?.category).filter(Boolean))
  );

  const frontmatter = [
    "---",
    `date: ${session.date}`,
    `type: workout`,
    `status: ${session.status}`,
    `total_duration_min: ${session.totalDurationMin || 0}`,
    `total_calories: ${session.totalCalories || 0}`,
    `exercises:`,
    ...exercisesYaml,
    `tags:`,
    `  - fitness`,
    ...categories.map((c) => `  - ${c}`),
    session.aiProvider ? `ai_provider: ${session.aiProvider}` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const exerciseDetails = session.entries
    .map((e) => {
      const name = e.exercise?.nameJa || e.exerciseId;
      const cat = e.exercise?.category || "";
      const lines = [`### ${name} (${cat})`];

      if (e.sets && e.reps) {
        lines.push(
          `- セット: ${e.sets} x ${e.reps}回${e.weightKg ? ` @ ${e.weightKg}kg` : ""}`
        );
      }
      lines.push(`- 時間: ${e.durationMin}分`);
      if (e.caloriesBurned) {
        lines.push(`- カロリー: ${e.caloriesBurned} kcal`);
      }
      return lines.join("\n");
    })
    .join("\n\n");

  const summary = [
    `## サマリー`,
    `- 合計時間: ${session.totalDurationMin || 0}分`,
    `- 合計カロリー: ${session.totalCalories || 0} kcal`,
  ].join("\n");

  const aiSection = session.aiEvaluation
    ? `\n## AIコーチ評価\n\n> ${session.aiEvaluation.replace(/\n/g, "\n> ")}`
    : "";

  const prevDate = getPrevDate(session.date);
  const links = [
    `\n## 関連リンク`,
    `- [[${prevDate}-workout|前回のワークアウト]]`,
  ].join("\n");

  return [
    frontmatter,
    "",
    `# ワークアウトログ ${session.date}`,
    "",
    `## エクササイズ`,
    "",
    exerciseDetails,
    "",
    summary,
    aiSection,
    links,
    "",
  ].join("\n");
}

function getPrevDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
