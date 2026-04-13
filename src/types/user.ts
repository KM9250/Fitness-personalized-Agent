export interface UserProfile {
  id: string;
  displayName: string;
  heightCm: number | null;
  weightKg: number | null;
  birthYear: number | null;
  gender: "male" | "female" | "other" | null;
  activityLevel:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | null;
  fitnessGoal:
    | "lose_weight"
    | "maintain"
    | "build_muscle"
    | "improve_endurance"
    | "flexibility"
    | null;
  preferredLanguage: string | null;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercent: number | null;
  notes: string | null;
}
