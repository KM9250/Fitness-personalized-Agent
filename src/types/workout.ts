export type WorkoutStatus = "in_progress" | "completed" | "cancelled";

export interface WorkoutSession {
  id: string;
  date: string;
  startedAt: string;
  endedAt: string | null;
  totalDurationMin: number | null;
  totalCalories: number | null;
  aiEvaluation: string | null;
  aiProvider: string | null;
  coachId: string | null;
  notes: string | null;
  status: WorkoutStatus | null;
}

export interface WorkoutEntry {
  id: string;
  sessionId: string;
  exerciseId: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  durationMin: number;
  caloriesBurned: number | null;
  orderIndex: number;
  notes: string | null;
}

export interface WorkoutSessionWithEntries extends WorkoutSession {
  entries: (WorkoutEntry & {
    exercise?: {
      nameJa: string;
      nameEn: string;
      category: string;
    };
  })[];
}
