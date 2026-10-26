import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { createFuelCalendarEvent, deleteCalendarEvent } from "@/lib/calendar";
import { getCurrentFuelEntries } from "@/lib/current-user-data";
import { fuelEntryFromExistingRow } from "@/lib/fuel-entry";
import { requireSession, requireWritableSession } from "@/lib/require-session";
import { getSheetCacheTag } from "@/lib/sheets";
import {
  getReceiptsBucket,
  getSessionOwnerId,
  getSupabaseAdminClient,
} from "@/lib/supabase";
import {
  deleteFuelEntryRecord,
  getFuelEntryById,
  getHighestOdometer,
  insertFuelEntry,
  updateFuelEntryRecord,
} from "@/lib/supabase-data";
import {
  createFuelEntrySchema,
  formatZodError,
  fullUpdateFuelEntrySchema,
  updateFuelEntrySchema,
  validateOdometerMonotonicity,
} from "@/lib/validation";
import type { FuelEntry } from "@/types/car";

const CACHE_KEY = "fuel_entries";

function toRowRecord(entry: FuelEntry) {
  return Object.fromEntries(
    Object.entries(entry).map(([key, value]) => [key, String(value ?? "")]),
  );
}

async function attachCalendarEventId(ownerId: string, entry: FuelEntry) {
  try {
    const eventId = await createFuelCalendarEvent(entry);

    if (!eventId) {
      return;
    }

    await updateFuelEntryRecord(ownerId, {
      ...entry,
      calendar_event_id: eventId,
    });
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
    const ownerId = getSessionOwnerId(authResult.session);
    const highestOdometer = await getHighestOdometer("fuel_entries", ownerId);
    const odometerError = validateOdometerMonotonicity(
      [highestOdometer],
      body.odometer,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const now = new Date().toISOString();
    const entry: FuelEntry = {
      id: uuidv4(),
      date: body.date,
      odometer: body.odometer,
      liters: body.liters,
      total_cost: body.total_cost,
      price_per_liter: Number((body.total_cost / body.liters).toFixed(3)),
      station: body.station || "",
      is_full_tank: body.is_full_tank,
      notes: body.notes || "",
      receipt_file_id: body.receipt_file_id || "",
      receipt_url: body.receipt_url || "",
      calendar_event_id: "",
      created_at: now,
      updated_at: now,
    };

    await insertFuelEntry(ownerId, entry);

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/fuel");
    revalidatePath("/");

    void attachCalendarEventId(ownerId, entry);

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
    const ownerId = getSessionOwnerId(authResult.session);
    const existing = await getFuelEntryById(ownerId, body.id);

    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const highestOdometer = await getHighestOdometer("fuel_entries", ownerId, body.id);
    const odometerError = validateOdometerMonotonicity(
      [highestOdometer],
      body.odometer,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const entry = fuelEntryFromExistingRow(toRowRecord(existing), {
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
      updated_at: new Date().toISOString(),
    });

    await updateFuelEntryRecord(ownerId, entry);

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
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
    const ownerId = getSessionOwnerId(authResult.session);
    const existing = await getFuelEntryById(ownerId, body.id);

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
      const entry = fuelEntryFromExistingRow(toRowRecord(existing), {
        receipt_file_id: body.receipt_file_id ?? existing.receipt_file_id,
        receipt_url: body.receipt_url ?? existing.receipt_url,
        updated_at: new Date().toISOString(),
      });

      await updateFuelEntryRecord(ownerId, entry);

      revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
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
    const highestOdometer = await getHighestOdometer("fuel_entries", ownerId, body.id);
    const odometerError = validateOdometerMonotonicity(
      [highestOdometer],
      full.odometer,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const entry = fuelEntryFromExistingRow(toRowRecord(existing), {
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
      updated_at: new Date().toISOString(),
    });

    await updateFuelEntryRecord(ownerId, entry);

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
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

    const ownerId = getSessionOwnerId(authResult.session);
    const entry = await getFuelEntryById(ownerId, entryId);

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const deleted = await deleteFuelEntryRecord(ownerId, entryId);

    if (!deleted) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    if (entry.receipt_file_id) {
      const { error: storageError } = await getSupabaseAdminClient().storage
        .from(getReceiptsBucket())
        .remove([entry.receipt_file_id]);

      if (storageError) {
        console.error("Receipt delete failed:", storageError);
      }
    }

    if (entry.calendar_event_id) {
      try {
        await deleteCalendarEvent(entry.calendar_event_id);
      } catch (calendarError) {
        console.error("Calendar event delete failed:", calendarError);
      }
    }

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
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
