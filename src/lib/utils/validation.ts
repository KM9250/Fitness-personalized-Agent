import { z } from "zod";

export const exerciseCreateSchema = z.object({
  nameJa: z.string().min(1, "名前（日本語）は必須です"),
  nameEn: z.string().min(1, "Name (English) is required"),
  category: z.enum(["strength", "cardio", "yoga", "stretching", "hiit"]),
  metValue: z.number().min(0.5).max(20),
  defaultDurationMin: z.number().int().min(1).max(180).optional(),
  muscleGroups: z.string().optional(),
  description: z.string().optional(),
});

export const workoutCreateSchema = z.object({
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      durationMin: z.number().int().min(1),
      sets: z.number().int().min(1).optional(),
      reps: z.number().int().min(1).optional(),
      weightKg: z.number().min(0).optional(),
    })
  ).min(1, "エクササイズを1つ以上選択してください"),
});

export const weightEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().min(20).max(300),
  bodyFatPercent: z.number().min(1).max(60).optional(),
  notes: z.string().optional(),
});

export const coachCreateSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  personalityPrompt: z.string().min(10, "人格プロンプトは10文字以上必要です"),
  llmProvider: z.string().optional(),
  llmModel: z.string().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  heightCm: z.number().min(50).max(250).optional(),
  weightKg: z.number().min(20).max(300).optional(),
  birthYear: z.number().int().min(1920).max(2020).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  fitnessGoal: z.enum(["lose_weight", "maintain", "build_muscle", "improve_endurance", "flexibility"]).optional(),
  preferredLanguage: z.string().optional(),
});
