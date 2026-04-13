import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiCoaches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getLanguageModel } from "@/lib/llm/providers";
import { getLLMConfig } from "@/lib/llm/config";
import { generateText } from "ai";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentExercise, elapsedTime, remainingExercises, coachId } = body;

    if (!currentExercise) {
      return NextResponse.json(
        { error: "currentExercise is required" },
        { status: 400 }
      );
    }

    const promptPath = path.join(
      process.cwd(),
      "src/lib/llm/prompts/spontaneous.md"
    );
    let spontaneousPrompt = fs.readFileSync(promptPath, "utf-8");

    spontaneousPrompt = spontaneousPrompt
      .replace("{{currentExercise}}", currentExercise)
      .replace("{{elapsedTime}}", String(elapsedTime ?? 0))
      .replace(
        "{{remainingExercises}}",
        Array.isArray(remainingExercises)
          ? remainingExercises.join(", ")
          : String(remainingExercises ?? "なし")
      );

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

    systemPrompt += spontaneousPrompt;

    const model = getLanguageModel(llmConfig);

    const { text } = await generateText({
      model: model as Parameters<typeof generateText>[0]["model"],
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "トレーニング中の励ましを一言お願いします。",
        },
      ],
      maxOutputTokens: 150,
    });

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Spontaneous message error:", error);
    return NextResponse.json(
      { error: "Failed to generate spontaneous message" },
      { status: 500 }
    );
  }
}
