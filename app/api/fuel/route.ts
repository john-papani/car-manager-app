import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { getCurrentFuelEntries } from "@/lib/current-user-data";
import { getDemoReadOnlyMessage, isDemoSession } from "@/lib/demo-mode";
import {
  appendRow,
  deleteRowById,
  getRowById,
  getSheetCacheTag,
  upsertRowById,
} from "@/lib/sheets";
import type { CreateFuelEntryInput, FuelEntry } from "@/types/car";

import { createFuelCalendarEvent } from "@/lib/calendar";
import { deleteCalendarEvent } from "@/lib/calendar";


const SHEET_NAME = "fuel_entries";

export async function GET() {
  try {
    const entries = (await getCurrentFuelEntries()).sort(
      (a, b) => b.odometer - a.odometer,
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch fuel entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (isDemoSession(session)) {
      return NextResponse.json(
        { message: getDemoReadOnlyMessage("add fuel entries") },
        { status: 403 },
      );
    }

    const body = (await request.json()) as CreateFuelEntryInput;

    if (!body.date || !body.odometer || !body.liters || !body.total_cost) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const pricePerLiter = Number((body.total_cost / body.liters).toFixed(3));

    const entry: FuelEntry = {
      id: uuidv4(),
      date: body.date,
      odometer: Number(body.odometer),
      liters: Number(body.liters),
      total_cost: Number(body.total_cost),
      price_per_liter: pricePerLiter,
      station: body.station || "",
      is_full_tank: Boolean(body.is_full_tank),
      notes: body.notes || "",
      receipt_file_id: body.receipt_file_id || "",
      receipt_url: body.receipt_url || "",
      created_at: now,
      updated_at: now,
    };

    await appendRow(SHEET_NAME, [
      entry.id,
      entry.date,
      entry.odometer,
      entry.liters,
      entry.total_cost,
      entry.price_per_liter,
      entry.station,
      entry.is_full_tank ? "TRUE" : "FALSE",
      entry.notes,
      entry.receipt_file_id,
      entry.receipt_url,
      entry.created_at,
      entry.updated_at,
    ]);

    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/fuel");
    revalidatePath("/");

    void createFuelCalendarEvent(entry).catch((calendarError) => {
      console.error("Calendar event creation failed:", calendarError);
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create fuel entry" },
      { status: 500 }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (isDemoSession(session)) {
      return NextResponse.json(
        { message: getDemoReadOnlyMessage("update fuel entries") },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      id?: string;
      receipt_file_id?: string;
      receipt_url?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { message: "Missing entry id" },
        { status: 400 },
      );
    }

    const existing = await getRowById(SHEET_NAME, body.id);

    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const updatedAt = new Date().toISOString();

    await upsertRowById(SHEET_NAME, body.id, [
      existing.id,
      existing.date,
      existing.odometer,
      existing.liters,
      existing.total_cost,
      existing.price_per_liter,
      existing.station,
      existing.is_full_tank === "TRUE" || existing.is_full_tank === "true"
        ? "TRUE"
        : "FALSE",
      existing.notes,
      body.receipt_file_id ?? existing.receipt_file_id,
      body.receipt_url ?? existing.receipt_url,
      existing.created_at,
      updatedAt,
    ]);

    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/fuel");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update fuel entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (isDemoSession(session)) {
      return NextResponse.json(
        { message: getDemoReadOnlyMessage("delete fuel entries") },
        { status: 403 },
      );
    }

    const entryId = request.nextUrl.searchParams.get("id") ?? "";

    if (!entryId) {
      return NextResponse.json(
        { message: "Missing entry id" },
        { status: 400 }
      );
    }

    const entry = await getRowById(SHEET_NAME, entryId);

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const deleted = await deleteRowById(SHEET_NAME, entryId);

    if (!deleted) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const calendarEventId = entry.calendar_event_id;

    if (calendarEventId) {
      try {
        await deleteCalendarEvent(calendarEventId);
      } catch (calendarError) {
        console.error("Calendar event delete failed:", calendarError);
      }
    }

    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/");
    revalidatePath("/fuel");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete fuel entry" },
      { status: 500 }
    );
  }
}
