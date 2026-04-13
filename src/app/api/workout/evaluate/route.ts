import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  workoutSessions,
  workoutEntries,
  exercises,
  userProfile,
  aiCoaches,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getLanguageModel } from "@/lib/llm/providers";
import { getLLMConfig } from "@/lib/llm/config";
import { streamText } from "ai";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, coachId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const session = db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .get();

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    const entries = db
      .select({
        id: workoutEntries.id,
        sets: workoutEntries.sets,
        reps: workoutEntries.reps,
        weightKg: workoutEntries.weightKg,
        durationMin: workoutEntries.durationMin,
        caloriesBurned: workoutEntries.caloriesBurned,
        orderIndex: workoutEntries.orderIndex,
        exercise: {
          nameJa: exercises.nameJa,
          nameEn: exercises.nameEn,
          category: exercises.category,
          metValue: exercises.metValue,
        },
      })
      .from(workoutEntries)
      .leftJoin(exercises, eq(workoutEntries.exerciseId, exercises.id))
      .where(eq(workoutEntries.sessionId, sessionId))
      .orderBy(workoutEntries.orderIndex)
      .all();

    const profile = db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, "default"))
      .get();

    let systemPrompt = "";

    if (coachId) {
      const coach = db
        .select()
        .from(aiCoaches)
        .where(eq(aiCoaches.id, coachId))
        .get();
      if (coach?.personalityPrompt) {
        systemPrompt = coach.personalityPrompt + "\n\n";
      }
    }

    const promptPath = path.join(
      process.cwd(),
      "src/lib/llm/prompts/evaluator.md"
    );
    let evaluatorPrompt = fs.readFileSync(promptPath, "utf-8");

    const workoutData = JSON.stringify(
      {
        date: session.date,
        status: session.status,
        totalDurationMin: session.totalDurationMin,
        totalCalories: session.totalCalories,
        entries: entries.map((e) => ({
          exercise: e.exercise?.nameJa ?? "Unknown",
          category: e.exercise?.category ?? "unknown",
          durationMin: e.durationMin,
          sets: e.sets,
          reps: e.reps,
          weightKg: e.weightKg,
          caloriesBurned: e.caloriesBurned,
        })),
      },
      null,
      2
    );

    const profileData = profile
      ? JSON.stringify(
          {
            displayName: profile.displayName,
            weightKg: profile.weightKg,
            heightCm: profile.heightCm,
            gender: profile.gender,
            activityLevel: profile.activityLevel,
            fitnessGoal: profile.fitnessGoal,
          },
          null,
          2
        )
      : "No profile available";

    evaluatorPrompt = evaluatorPrompt
      .replace("{{workoutData}}", workoutData)
      .replace("{{profile}}", profileData);

    systemPrompt += evaluatorPrompt;

    let llmConfig;
    if (coachId) {
      const coach = db
        .select()
        .from(aiCoaches)
        .where(eq(aiCoaches.id, coachId))
        .get();
      llmConfig = getLLMConfig(
        coach?.llmProvider ?? undefined,
        coach?.llmModel ?? undefined
      );
    } else {
      llmConfig = getLLMConfig();
    }

    const model = getLanguageModel(llmConfig);

    const result = streamText({
      model: model as Parameters<typeof streamText>[0]["model"],
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "このワークアウトセッションを評価してください。",
        },
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Evaluate error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate workout" },
      { status: 500 }
    );
  }
}
