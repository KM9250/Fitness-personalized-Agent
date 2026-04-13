import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const profile = db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, "default"))
      .get();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const existing = db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, "default"))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.heightCm !== undefined) updateData.heightCm = body.heightCm;
    if (body.weightKg !== undefined) updateData.weightKg = body.weightKg;
    if (body.birthYear !== undefined) updateData.birthYear = body.birthYear;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.activityLevel !== undefined) updateData.activityLevel = body.activityLevel;
    if (body.fitnessGoal !== undefined) updateData.fitnessGoal = body.fitnessGoal;
    if (body.preferredLanguage !== undefined) updateData.preferredLanguage = body.preferredLanguage;

    db.update(userProfile)
      .set(updateData)
      .where(eq(userProfile.id, "default"))
      .run();

    const updated = db
      .select()
      .from(userProfile)
      .where(eq(userProfile.id, "default"))
      .get();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
