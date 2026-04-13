import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  workoutSessions,
  workoutEntries,
  exercises,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const session = db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id))
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
        sessionId: workoutEntries.sessionId,
        exerciseId: workoutEntries.exerciseId,
        sets: workoutEntries.sets,
        reps: workoutEntries.reps,
        weightKg: workoutEntries.weightKg,
        durationMin: workoutEntries.durationMin,
        caloriesBurned: workoutEntries.caloriesBurned,
        orderIndex: workoutEntries.orderIndex,
        notes: workoutEntries.notes,
        exercise: {
          nameJa: exercises.nameJa,
          nameEn: exercises.nameEn,
          category: exercises.category,
          metValue: exercises.metValue,
        },
      })
      .from(workoutEntries)
      .leftJoin(exercises, eq(workoutEntries.exerciseId, exercises.id))
      .where(eq(workoutEntries.sessionId, id))
      .orderBy(workoutEntries.orderIndex)
      .all();

    return NextResponse.json({ ...session, entries });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch workout session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const session = db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id))
      .get();

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.endedAt !== undefined) updateData.endedAt = body.endedAt;
    if (body.totalDurationMin !== undefined) updateData.totalDurationMin = body.totalDurationMin;
    if (body.totalCalories !== undefined) updateData.totalCalories = body.totalCalories;
    if (body.aiEvaluation !== undefined) updateData.aiEvaluation = body.aiEvaluation;
    if (body.notes !== undefined) updateData.notes = body.notes;

    if (body.status === "completed") {
      const entries = db
        .select()
        .from(workoutEntries)
        .where(eq(workoutEntries.sessionId, id))
        .all();

      const totalCalories = entries.reduce(
        (sum, e) => sum + (e.caloriesBurned ?? 0),
        0
      );
      const totalDurationMin = entries.reduce(
        (sum, e) => sum + e.durationMin,
        0
      );

      updateData.totalCalories = totalCalories;
      updateData.totalDurationMin = totalDurationMin;
      if (!updateData.endedAt) {
        updateData.endedAt = new Date().toISOString();
      }
    }

    db.update(workoutSessions)
      .set(updateData)
      .where(eq(workoutSessions.id, id))
      .run();

    const updated = db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id))
      .get();

    return NextResponse.json(updated);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to update workout session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const session = db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id))
      .get();

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    db.delete(workoutSessions)
      .where(eq(workoutSessions.id, id))
      .run();

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to delete workout session" },
      { status: 500 }
    );
  }
}
