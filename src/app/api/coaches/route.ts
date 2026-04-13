import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiCoaches } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const coaches = db
      .select()
      .from(aiCoaches)
      .orderBy(desc(aiCoaches.isActive), desc(aiCoaches.createdAt))
      .all();

    return NextResponse.json(coaches);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, personalityPrompt, llmProvider, llmModel, description, avatarUrl } = body;

    if (!name || !personalityPrompt) {
      return NextResponse.json(
        { error: "Missing required fields: name, personalityPrompt" },
        { status: 400 }
      );
    }

    const id = uuid();
    const now = new Date().toISOString();

    const newCoach = {
      id,
      name,
      personalityPrompt,
      llmProvider: llmProvider ?? "openai",
      llmModel: llmModel ?? "gpt-4o-mini",
      description: description ?? null,
      avatarUrl: avatarUrl ?? null,
      isActive: false,
      isPreset: false,
      createdAt: now,
    };

    db.insert(aiCoaches).values(newCoach).run();

    return NextResponse.json(newCoach, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create coach" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const existing = db
      .select()
      .from(aiCoaches)
      .where(eq(aiCoaches.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (fields.name !== undefined) updateData.name = fields.name;
    if (fields.personalityPrompt !== undefined) updateData.personalityPrompt = fields.personalityPrompt;
    if (fields.llmProvider !== undefined) updateData.llmProvider = fields.llmProvider;
    if (fields.llmModel !== undefined) updateData.llmModel = fields.llmModel;
    if (fields.description !== undefined) updateData.description = fields.description;
    if (fields.avatarUrl !== undefined) updateData.avatarUrl = fields.avatarUrl;
    if (fields.isActive !== undefined) updateData.isActive = fields.isActive;

    db.update(aiCoaches)
      .set(updateData)
      .where(eq(aiCoaches.id, id))
      .run();

    const updated = db
      .select()
      .from(aiCoaches)
      .where(eq(aiCoaches.id, id))
      .get();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update coach" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const coach = db
      .select()
      .from(aiCoaches)
      .where(eq(aiCoaches.id, id))
      .get();

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    if (coach.isPreset) {
      return NextResponse.json(
        { error: "Cannot delete preset coaches" },
        { status: 403 }
      );
    }

    db.delete(aiCoaches)
      .where(eq(aiCoaches.id, id))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete coach" },
      { status: 500 }
    );
  }
}
