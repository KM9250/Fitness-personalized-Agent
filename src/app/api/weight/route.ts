import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weightEntries, userProfile } from "@/lib/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const conditions = [];
    if (from) {
      conditions.push(gte(weightEntries.date, from));
    }
    if (to) {
      conditions.push(lte(weightEntries.date, to));
    }

    let results;
    if (conditions.length > 0) {
      results = db
        .select()
        .from(weightEntries)
        .where(and(...conditions))
        .orderBy(desc(weightEntries.date))
        .all();
    } else {
      results = db
        .select()
        .from(weightEntries)
        .orderBy(desc(weightEntries.date))
        .all();
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch weight entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, weightKg, bodyFatPercent, notes } = body;

    if (!date || weightKg == null) {
      return NextResponse.json(
        { error: "Missing required fields: date, weightKg" },
        { status: 400 }
      );
    }

    const id = uuid();

    const newEntry = {
      id,
      date,
      weightKg,
      bodyFatPercent: bodyFatPercent ?? null,
      notes: notes ?? null,
    };

    db.insert(weightEntries).values(newEntry).run();

    // Update userProfile with the latest weight
    db.update(userProfile)
      .set({ weightKg })
      .where(eq(userProfile.id, "default"))
      .run();

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create weight entry" },
      { status: 500 }
    );
  }
}
