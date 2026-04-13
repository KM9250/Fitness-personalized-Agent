export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "yoga"
  | "stretching"
  | "hiit";

export interface Exercise {
  id: string;
  nameJa: string;
  nameEn: string;
  category: ExerciseCategory;
  metValue: number;
  defaultDurationMin: number | null;
  description: string | null;
  muscleGroups: string | null;
  isCustom: boolean | null;
}

export const CATEGORY_LABELS: Record<ExerciseCategory, { ja: string; en: string }> = {
  strength: { ja: "筋トレ", en: "Strength" },
  cardio: { ja: "有酸素運動", en: "Cardio" },
  yoga: { ja: "ヨガ", en: "Yoga" },
  stretching: { ja: "ストレッチ", en: "Stretching" },
  hiit: { ja: "HIIT", en: "HIIT" },
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  strength: "bg-red-500",
  cardio: "bg-blue-500",
  yoga: "bg-purple-500",
  stretching: "bg-green-500",
  hiit: "bg-orange-500",
};
