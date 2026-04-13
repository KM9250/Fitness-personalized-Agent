import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  nameJa: text("name_ja").notNull(),
  nameEn: text("name_en").notNull(),
  category: text("category", {
    enum: ["strength", "cardio", "yoga", "stretching", "hiit"],
  }).notNull(),
  metValue: real("met_value").notNull(),
  defaultDurationMin: integer("default_duration_min").default(10),
  description: text("description"),
  muscleGroups: text("muscle_groups"), // JSON array
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
});

export const workoutSessions = sqliteTable("workout_sessions", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  totalDurationMin: integer("total_duration_min"),
  totalCalories: real("total_calories"),
  aiEvaluation: text("ai_evaluation"),
  aiProvider: text("ai_provider"),
  coachId: text("coach_id"),
  notes: text("notes"),
  status: text("status", {
    enum: ["in_progress", "completed", "cancelled"],
  }).default("in_progress"),
});

export const workoutEntries = sqliteTable("workout_entries", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  sets: integer("sets"),
  reps: integer("reps"),
  weightKg: real("weight_kg"),
  durationMin: integer("duration_min").notNull(),
  caloriesBurned: real("calories_burned"),
  orderIndex: integer("order_index").notNull(),
  notes: text("notes"),
});

export const userProfile = sqliteTable("user_profile", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  birthYear: integer("birth_year"),
  gender: text("gender", { enum: ["male", "female", "other"] }),
  activityLevel: text("activity_level", {
    enum: ["sedentary", "light", "moderate", "active", "very_active"],
  }),
  fitnessGoal: text("fitness_goal", {
    enum: [
      "lose_weight",
      "maintain",
      "build_muscle",
      "improve_endurance",
      "flexibility",
    ],
  }),
  preferredLanguage: text("preferred_language").default("ja"),
  createdAt: text("created_at").notNull(),
});

export const weightEntries = sqliteTable("weight_entries", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  weightKg: real("weight_kg").notNull(),
  bodyFatPercent: real("body_fat_percent"),
  notes: text("notes"),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  provider: text("provider"),
  model: text("model"),
  coachId: text("coach_id"),
  createdAt: text("created_at").notNull(),
  sessionContext: text("session_context"),
});

export const aiCoaches = sqliteTable("ai_coaches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  personalityPrompt: text("personality_prompt").notNull(),
  llmProvider: text("llm_provider").default("openai"),
  llmModel: text("llm_model").default("gpt-4o-mini"),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(false),
  isPreset: integer("is_preset", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});
