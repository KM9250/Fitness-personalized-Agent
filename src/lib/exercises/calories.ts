/**
 * Calculate calories burned using MET formula
 * Calories = MET x weight(kg) x duration(hours)
 */
export function calculateCalories(
  metValue: number,
  weightKg: number,
  durationMin: number
): number {
  return Math.round(metValue * weightKg * (durationMin / 60) * 10) / 10;
}
