import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const allSettings = db.select().from(settings).all();

    const settingsObject: Record<string, string> = {};
    for (const setting of allSettings) {
      settingsObject[setting.key] = setting.value;
    }

    return NextResponse.json(settingsObject);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a key-value object" },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries(body)) {
      const existing = db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .get();

      if (existing) {
        db.update(settings)
          .set({ value: String(value) })
          .where(eq(settings.key, key))
          .run();
      } else {
        db.insert(settings)
          .values({
            id: uuid(),
            key,
            value: String(value),
          })
          .run();
      }
    }

    // Return the updated settings
    const allSettings = db.select().from(settings).all();
    const settingsObject: Record<string, string> = {};
    for (const setting of allSettings) {
      settingsObject[setting.key] = setting.value;
    }

    return NextResponse.json(settingsObject);
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
