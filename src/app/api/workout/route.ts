import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  workoutSessions,
  workoutEntries,
  exercises,
  userProfile,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { calculateCalories } from "@/lib/exercises/calories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const sessions = db
      .select()
      .from(workoutSessions)
      .orderBy(desc(workoutSessions.date))
      .limit(limit)
      .offset(offset)
      .all();

    const sessionsWithEntries = sessions.map((session) => {
      const entries = db
        .select()
        .from(workoutEntries)
        .where(eq(workoutEntries.sessionId, session.id))
        .orderBy(workoutEntries.orderIndex)
        .all();
      return { ...session, entries };
    });

    return NextResponse.json(sessionsWithEntries);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch workout sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { exercises: exerciseInputs } = body;

    if (!exerciseInputs || !Array.isArray(exerciseInputs) || exerciseInputs.length === 0) {
      return NextResponse.json(
        { error: "exercises array is required and must not be empty" },
        { status: 400 }
      );
    }

    const profile = db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, "default"))
      .get();

    const userWeightKg = profile?.weightKg ?? 70;

    const sessionId = uuid();
    const now = new Date().toISOString();
    const dateOnly = now.split("T")[0];

    const session = {
      id: sessionId,
      date: dateOnly,
      startedAt: now,
      endedAt: null,
      totalDurationMin: null,
      totalCalories: null,
      aiEvaluation: null,
      aiProvider: null,
      coachId: null,
      notes: null,
      status: "in_progress" as const,
    };

    db.insert(workoutSessions).values(session).run();

    const entries = [];
    // Running totals computed per-entry via calculateCalories


    for (let i = 0; i < exerciseInputs.length; i++) {
      const input = exerciseInputs[i];
      const exercise = db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .get();

      if (!exercise) {
        return NextResponse.json(
          { error: `Exercise not found: ${input.exerciseId}` },
          { status: 404 }
        );
      }

      const durationMin = input.durationMin ?? exercise.defaultDurationMin ?? 10;
      const caloriesBurned = calculateCalories(
        exercise.metValue,
        userWeightKg,
        durationMin
      );

      const entry = {
        id: uuid(),
        sessionId,
        exerciseId: input.exerciseId,
        sets: input.sets ?? null,
        reps: input.reps ?? null,
        weightKg: input.weightKg ?? null,
        durationMin,
        caloriesBurned,
        orderIndex: i,
        notes: null,
      };

      db.insert(workoutEntries).values(entry).run();
      entries.push(entry);
    }

    return NextResponse.json(
      { ...session, entries },
      { status: 201 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create workout session" },
      { status: 500 }
    );
  }
}
