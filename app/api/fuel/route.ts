import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { createFuelCalendarEvent, deleteCalendarEvent } from "@/lib/calendar";
import { getCurrentFuelEntries } from "@/lib/current-user-data";
import {
  fuelEntryFromExistingRow,
  fuelEntryToRowValues,
} from "@/lib/fuel-entry";
import { requireSession, requireWritableSession } from "@/lib/require-session";
import {
  appendRow,
  deleteRowById,
  getRowById,
  getSheetCacheTag,
  upsertRowById,
} from "@/lib/sheets";
import {
  createFuelEntrySchema,
  formatZodError,
  fullUpdateFuelEntrySchema,
  updateFuelEntrySchema,
  validateOdometerMonotonicity,
} from "@/lib/validation";
import type { FuelEntry } from "@/types/car";

const SHEET_NAME = "fuel_entries";

async function attachCalendarEventId(entry: FuelEntry) {
  try {
    const eventId = await createFuelCalendarEvent(entry);

    if (!eventId) {
      return;
    }

    await upsertRowById(
      SHEET_NAME,
      entry.id,
      fuelEntryToRowValues({ ...entry, calendar_event_id: eventId }),
    );
  } catch (calendarError) {
    console.error("Calendar event creation failed:", calendarError);
  }
}

export async function GET() {
  try {
    const authResult = await requireSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    const entries = (await getCurrentFuelEntries(authResult.session)).sort(
      (a, b) => b.odometer - a.odometer,
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch fuel entries" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("add fuel entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = createFuelEntrySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const existingEntries = await getCurrentFuelEntries(authResult.session);
    const odometerError = validateOdometerMonotonicity(
      existingEntries.map((entry) => entry.odometer),
      body.odometer,
      undefined,
      existingEntries,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const now = new Date().toISOString();
    const pricePerLiter = Number((body.total_cost / body.liters).toFixed(3));

    const entry: FuelEntry = {
      id: uuidv4(),
      date: body.date,
      odometer: body.odometer,
      liters: body.liters,
      total_cost: body.total_cost,
      price_per_liter: pricePerLiter,
      station: body.station || "",
      is_full_tank: body.is_full_tank,
      notes: body.notes || "",
      receipt_file_id: body.receipt_file_id || "",
      receipt_url: body.receipt_url || "",
      calendar_event_id: "",
      created_at: now,
      updated_at: now,
    };

    await appendRow(SHEET_NAME, fuelEntryToRowValues(entry));

    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/fuel");
    revalidatePath("/");

    void attachCalendarEventId(entry);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create fuel entry" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("update fuel entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = fullUpdateFuelEntrySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const existing = await getRowById(SHEET_NAME, body.id);

    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const existingEntries = await getCurrentFuelEntries(authResult.session);
    const odometerError = validateOdometerMonotonicity(
      existingEntries.map((entry) => entry.odometer),
      body.odometer,
      body.id,
      existingEntries,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const updatedAt = new Date().toISOString();
    const entry = fuelEntryFromExistingRow(existing, {
      date: body.date,
      odometer: body.odometer,
      liters: body.liters,
      total_cost: body.total_cost,
      station: body.station || "",
      is_full_tank: body.is_full_tank,
      notes: body.notes || "",
      receipt_file_id: body.receipt_file_id || existing.receipt_file_id || "",
      receipt_url: body.receipt_url || existing.receipt_url || "",
      calendar_event_id: existing.calendar_event_id || "",
      created_at: existing.created_at,
      updated_at: updatedAt,
    });

    await upsertRowById(SHEET_NAME, body.id, fuelEntryToRowValues(entry));

    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/fuel");
    revalidatePath("/");

    return NextResponse.json({ entry });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update fuel entry" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("update fuel entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = updateFuelEntrySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const existing = await getRowById(SHEET_NAME, body.id);

    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const isReceiptOnlyUpdate =
      body.date === undefined &&
      body.odometer === undefined &&
      body.liters === undefined &&
      body.total_cost === undefined &&
      body.station === undefined &&
      body.is_full_tank === undefined &&
      body.notes === undefined;

    if (isReceiptOnlyUpdate) {
      const updatedAt = new Date().toISOString();
      const entry = fuelEntryFromExistingRow(existing, {
        receipt_file_id: body.receipt_file_id ?? existing.receipt_file_id,
        receipt_url: body.receipt_url ?? existing.receipt_url,
        updated_at: updatedAt,
      });

      await upsertRowById(SHEET_NAME, body.id, fuelEntryToRowValues(entry));

      revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
      revalidatePath("/fuel");
      revalidatePath("/");

      return NextResponse.json({ success: true });
    }

    const fullBody = fullUpdateFuelEntrySchema.safeParse(body);

    if (!fullBody.success) {
      return NextResponse.json(
        { message: formatZodError(fullBody.error) },
        { status: 400 },
      );
    }

    const full = fullBody.data;
    const existingEntries = await getCurrentFuelEntries(authResult.session);
    const odometerError = validateOdometerMonotonicity(
      existingEntries.map((entry) => entry.odometer),
      full.odometer,
      full.id,
      existingEntries,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const updatedAt = new Date().toISOString();
    const entry = fuelEntryFromExistingRow(existing, {
      date: full.date,
      odometer: full.odometer,
      liters: full.liters,
      total_cost: full.total_cost,
      station: full.station || "",
      is_full_tank: full.is_full_tank,
      notes: full.notes || "",
      receipt_file_id: full.receipt_file_id || existing.receipt_file_id || "",
      receipt_url: full.receipt_url || existing.receipt_url || "",
      calendar_event_id: existing.calendar_event_id || "",
      created_at: existing.created_at,
      updated_at: updatedAt,
    });

    await upsertRowById(SHEET_NAME, full.id, fuelEntryToRowValues(entry));

    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/fuel");
    revalidatePath("/");

    return NextResponse.json({ entry });
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
    const authResult = await requireWritableSession("delete fuel entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const entryId = request.nextUrl.searchParams.get("id") ?? "";

    if (!entryId) {
      return NextResponse.json(
        { message: "Missing entry id" },
        { status: 400 },
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
      { status: 500 },
    );
  }
}
