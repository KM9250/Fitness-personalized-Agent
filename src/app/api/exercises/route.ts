import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const query = db.select().from(exercises);

    if (category) {
      const results = query
        .where(eq(exercises.category, category as "strength" | "cardio" | "yoga" | "stretching" | "hiit"))
        .orderBy(exercises.category)
        .all();
      return NextResponse.json(results);
    }

    const results = query.orderBy(exercises.category).all();
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nameJa,
      nameEn,
      category,
      metValue,
      defaultDurationMin,
      muscleGroups,
      description,
    } = body;

    if (!nameJa || !nameEn || !category || metValue == null) {
      return NextResponse.json(
        { error: "Missing required fields: nameJa, nameEn, category, metValue" },
        { status: 400 }
      );
    }

    const id = uuid();
    const newExercise = {
      id,
      nameJa,
      nameEn,
      category: category as "strength" | "cardio" | "yoga" | "stretching" | "hiit",
      metValue,
      defaultDurationMin: defaultDurationMin ?? 10,
      muscleGroups: muscleGroups ? JSON.stringify(muscleGroups) : null,
      description: description ?? null,
      isCustom: true,
    };

    db.insert(exercises).values(newExercise).run();

    return NextResponse.json(newExercise, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
