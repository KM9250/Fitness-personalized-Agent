import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// API keys must never leave the server in plaintext.
// Clients only need to know whether a key is stored, so values of
// *_api_key entries are replaced with a masked marker.
function maskSecrets(obj: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.endsWith("_api_key") && value) {
      masked[key] =
        value.length > 4 ? `••••${value.slice(-4)}` : "••••••••";
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

export async function GET() {
  try {
    const allSettings = db.select().from(settings).all();

    const settingsObject: Record<string, string> = {};
    for (const setting of allSettings) {
      settingsObject[setting.key] = setting.value;
    }

    return NextResponse.json(maskSecrets(settingsObject));
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
      // Never persist a masked marker over a real stored key
      if (key.endsWith("_api_key") && String(value).startsWith("••••")) {
        continue;
      }
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

    return NextResponse.json(maskSecrets(settingsObject));
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
