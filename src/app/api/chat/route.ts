import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  chatMessages,
  aiCoaches,
  userProfile,
  workoutSessions,
  workoutEntries,
  exercises,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getLanguageModel } from "@/lib/llm/providers";
import { getLLMConfig } from "@/lib/llm/config";
import { streamText } from "ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, coachId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const profile = db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, "default"))
      .get();

    const recentSessions = db
      .select()
      .from(workoutSessions)
      .orderBy(desc(workoutSessions.date))
      .limit(3)
      .all();

    const recentWorkoutContext = [];
    for (const session of recentSessions) {
      const entries = db
        .select({
          durationMin: workoutEntries.durationMin,
          caloriesBurned: workoutEntries.caloriesBurned,
          exercise: {
            nameJa: exercises.nameJa,
            category: exercises.category,
          },
        })
        .from(workoutEntries)
        .leftJoin(exercises, eq(workoutEntries.exerciseId, exercises.id))
        .where(eq(workoutEntries.sessionId, session.id))
        .orderBy(workoutEntries.orderIndex)
        .all();

      recentWorkoutContext.push({
        date: session.date,
        status: session.status,
        totalCalories: session.totalCalories,
        totalDurationMin: session.totalDurationMin,
        exercises: entries.map((e) => ({
          name: e.exercise?.nameJa ?? "Unknown",
          category: e.exercise?.category ?? "unknown",
          durationMin: e.durationMin,
          calories: e.caloriesBurned,
        })),
      });
    }

    let systemPrompt = "";

    let llmConfig;
    if (coachId) {
      const coach = db
        .select()
        .from(aiCoaches)
        .where(eq(aiCoaches.id, coachId))
        .get();

      if (coach) {
        systemPrompt = coach.personalityPrompt + "\n\n";
        llmConfig = getLLMConfig(
          coach.llmProvider ?? undefined,
          coach.llmModel ?? undefined
        );
      } else {
        llmConfig = getLLMConfig();
      }
    } else {
      llmConfig = getLLMConfig();
    }

    if (profile) {
      systemPrompt += `## ユーザープロフィール\n`;
      systemPrompt += `名前: ${profile.displayName}\n`;
      if (profile.weightKg) systemPrompt += `体重: ${profile.weightKg}kg\n`;
      if (profile.heightCm) systemPrompt += `身長: ${profile.heightCm}cm\n`;
      if (profile.fitnessGoal) systemPrompt += `目標: ${profile.fitnessGoal}\n`;
      if (profile.activityLevel)
        systemPrompt += `活動レベル: ${profile.activityLevel}\n`;
      systemPrompt += "\n";
    }

    if (recentWorkoutContext.length > 0) {
      systemPrompt += `## 最近のワークアウト\n`;
      systemPrompt += JSON.stringify(recentWorkoutContext, null, 2);
      systemPrompt += "\n";
    }

    const model = getLanguageModel(llmConfig!);

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      onFinish: async ({ text }) => {
        try {
          const lastUserMessage = messages[messages.length - 1];
          if (lastUserMessage && lastUserMessage.role === "user") {
            db.insert(chatMessages)
              .values({
                id: uuid(),
                role: "user",
                content:
                  typeof lastUserMessage.content === "string"
                    ? lastUserMessage.content
                    : JSON.stringify(lastUserMessage.content),
                provider: llmConfig!.provider,
                model: llmConfig!.model,
                coachId: coachId ?? null,
                createdAt: new Date().toISOString(),
                sessionContext: null,
              })
              .run();
          }

          db.insert(chatMessages)
            .values({
              id: uuid(),
              role: "assistant",
              content: text,
              provider: llmConfig!.provider,
              model: llmConfig!.model,
              coachId: coachId ?? null,
              createdAt: new Date().toISOString(),
              sessionContext: null,
            })
            .run();
        } catch (saveError) {
          console.error("Failed to save chat messages:", saveError);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
