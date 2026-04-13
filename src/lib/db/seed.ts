import { db } from "./index";
import { exercises, aiCoaches, userProfile, settings } from "./schema";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";

const EXERCISE_SEED = [
  // Strength Training
  { id: "bench-press", nameJa: "ベンチプレス", nameEn: "Bench Press", category: "strength" as const, metValue: 6.0, defaultDurationMin: 15, muscleGroups: '["chest","triceps","shoulders"]' },
  { id: "squat", nameJa: "スクワット", nameEn: "Squat", category: "strength" as const, metValue: 5.0, defaultDurationMin: 15, muscleGroups: '["quadriceps","glutes","hamstrings"]' },
  { id: "deadlift", nameJa: "デッドリフト", nameEn: "Deadlift", category: "strength" as const, metValue: 6.0, defaultDurationMin: 15, muscleGroups: '["back","glutes","hamstrings"]' },
  { id: "shoulder-press", nameJa: "ショルダープレス", nameEn: "Shoulder Press", category: "strength" as const, metValue: 5.0, defaultDurationMin: 10, muscleGroups: '["shoulders","triceps"]' },
  { id: "bicep-curl", nameJa: "バイセップカール", nameEn: "Bicep Curl", category: "strength" as const, metValue: 4.0, defaultDurationMin: 10, muscleGroups: '["biceps"]' },
  // Cardio
  { id: "running", nameJa: "ランニング", nameEn: "Running", category: "cardio" as const, metValue: 8.3, defaultDurationMin: 30, muscleGroups: '["legs","core"]' },
  { id: "cycling", nameJa: "サイクリング", nameEn: "Cycling", category: "cardio" as const, metValue: 7.5, defaultDurationMin: 30, muscleGroups: '["legs","core"]' },
  { id: "jump-rope", nameJa: "縄跳び", nameEn: "Jump Rope", category: "cardio" as const, metValue: 12.3, defaultDurationMin: 15, muscleGroups: '["legs","shoulders","core"]' },
  { id: "swimming", nameJa: "水泳", nameEn: "Swimming", category: "cardio" as const, metValue: 7.0, defaultDurationMin: 30, muscleGroups: '["full_body"]' },
  { id: "walking", nameJa: "ウォーキング", nameEn: "Walking", category: "cardio" as const, metValue: 3.5, defaultDurationMin: 30, muscleGroups: '["legs"]' },
  // Yoga
  { id: "hatha-yoga", nameJa: "ハタヨガ", nameEn: "Hatha Yoga", category: "yoga" as const, metValue: 2.5, defaultDurationMin: 30, muscleGroups: '["full_body"]' },
  { id: "vinyasa-yoga", nameJa: "ヴィンヤサヨガ", nameEn: "Vinyasa Yoga", category: "yoga" as const, metValue: 4.0, defaultDurationMin: 30, muscleGroups: '["full_body"]' },
  { id: "power-yoga", nameJa: "パワーヨガ", nameEn: "Power Yoga", category: "yoga" as const, metValue: 4.0, defaultDurationMin: 30, muscleGroups: '["full_body"]' },
  // Stretching
  { id: "static-stretch", nameJa: "ストレッチ", nameEn: "Static Stretching", category: "stretching" as const, metValue: 2.3, defaultDurationMin: 15, muscleGroups: '["full_body"]' },
  { id: "foam-rolling", nameJa: "フォームローラー", nameEn: "Foam Rolling", category: "stretching" as const, metValue: 2.0, defaultDurationMin: 10, muscleGroups: '["full_body"]' },
  // HIIT
  { id: "hiit-circuit", nameJa: "HIIT サーキット", nameEn: "HIIT Circuit", category: "hiit" as const, metValue: 8.0, defaultDurationMin: 20, muscleGroups: '["full_body"]' },
  { id: "burpees", nameJa: "バーピー", nameEn: "Burpees", category: "hiit" as const, metValue: 8.0, defaultDurationMin: 10, muscleGroups: '["full_body"]' },
  { id: "mountain-climbers", nameJa: "マウンテンクライマー", nameEn: "Mountain Climbers", category: "hiit" as const, metValue: 8.0, defaultDurationMin: 10, muscleGroups: '["core","legs","shoulders"]' },
];

function loadPromptFile(filename: string): string {
  const promptPath = path.resolve("src/lib/llm/prompts/coaches", filename);
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, "utf-8");
  }
  return "";
}

const COACH_SEED = [
  {
    id: "energetic-trainer",
    name: "タケシ (熱血トレーナー)",
    avatarUrl: "/avatars/energetic-trainer.svg",
    personalityFile: "energetic-trainer.md",
    llmProvider: "openai",
    llmModel: "gpt-4o-mini",
    description: "やる気を引き出す熱血型トレーナー。筋トレが得意で、限界を超えるサポートをします。",
    isActive: true,
    isPreset: true,
  },
  {
    id: "yoga-instructor",
    name: "サクラ (ヨガインストラクター)",
    avatarUrl: "/avatars/yoga-instructor.svg",
    personalityFile: "yoga-instructor.md",
    llmProvider: "openai",
    llmModel: "gpt-4o-mini",
    description: "穏やかで優しいヨガインストラクター。心身のバランスと柔軟性を重視します。",
    isActive: false,
    isPreset: true,
  },
  {
    id: "analyst-coach",
    name: "レイ (データ分析コーチ)",
    avatarUrl: "/avatars/analyst-coach.svg",
    personalityFile: "analyst-coach.md",
    llmProvider: "openai",
    llmModel: "gpt-4o-mini",
    description: "数値とデータに基づくアドバイスを提供する分析型コーチ。効率的なトレーニングを追求します。",
    isActive: false,
    isPreset: true,
  },
];

export async function seed() {
  console.log("Seeding exercises...");
  for (const exercise of EXERCISE_SEED) {
    db.insert(exercises)
      .values({ ...exercise, isCustom: false })
      .onConflictDoNothing()
      .run();
  }

  console.log("Seeding AI coaches...");
  const now = new Date().toISOString();
  for (const coach of COACH_SEED) {
    const prompt = loadPromptFile(coach.personalityFile);
    db.insert(aiCoaches)
      .values({
        id: coach.id,
        name: coach.name,
        avatarUrl: coach.avatarUrl,
        personalityPrompt: prompt || `You are ${coach.name}. ${coach.description}`,
        llmProvider: coach.llmProvider,
        llmModel: coach.llmModel,
        description: coach.description,
        isActive: coach.isActive,
        isPreset: coach.isPreset,
        createdAt: now,
      })
      .onConflictDoNothing()
      .run();
  }

  console.log("Seeding default profile...");
  db.insert(userProfile)
    .values({
      id: "default",
      displayName: "ユーザー",
      weightKg: 65,
      heightCm: 170,
      preferredLanguage: "ja",
      createdAt: now,
    })
    .onConflictDoNothing()
    .run();

  console.log("Seeding default settings...");
  const defaultSettings = [
    { key: "llm_provider", value: "openai" },
    { key: "llm_model", value: "gpt-4o-mini" },
    { key: "spontaneous_enabled", value: "false" },
    { key: "spontaneous_interval_min", value: "3" },
    { key: "spontaneous_max_tokens", value: "150" },
  ];
  for (const s of defaultSettings) {
    db.insert(settings)
      .values({ id: uuid(), ...s })
      .onConflictDoNothing()
      .run();
  }

  console.log("Seed completed.");
}

// Run directly
seed();
