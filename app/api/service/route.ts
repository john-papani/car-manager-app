import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getCurrentServiceEntries } from "@/lib/current-user-data";
import { requireSession, requireWritableSession } from "@/lib/require-session";
import { getSheetCacheTag } from "@/lib/sheets";
import { getSessionOwnerId } from "@/lib/supabase";
import {
  deleteServiceEntryRecord,
  getServiceEntryById,
  getHighestOdometer,
  insertServiceEntry,
  updateServiceEntryRecord,
} from "@/lib/supabase-data";
import {
  createServiceEntrySchema,
  formatZodError,
  updateServiceEntrySchema,
  validateOdometerMonotonicity,
} from "@/lib/validation";
import type { ServiceEntry } from "@/types/car";

const CACHE_KEY = "service_entries";

export async function GET() {
  try {
    const authResult = await requireSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    const entries = (await getCurrentServiceEntries(authResult.session)).sort(
      (a, b) => b.odometer - a.odometer,
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch service entries" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("add service entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = createServiceEntrySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const ownerId = getSessionOwnerId(authResult.session);
    const highestOdometer = await getHighestOdometer("service_entries", ownerId);
    const odometerError = validateOdometerMonotonicity(
      [highestOdometer],
      body.odometer,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const now = new Date().toISOString();

    const entry: ServiceEntry = {
      id: uuidv4(),
      date: body.date,
      odometer: body.odometer,
      total_cost: body.total_cost,
      service_type: body.service_type,
      location: body.location || "",
      next_service_odometer: body.next_service_odometer,
      notes: body.notes || "",
      created_at: now,
      updated_at: now,
    };

    await insertServiceEntry(ownerId, entry);
    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/service");
    revalidatePath("/");

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create service entry" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("update service entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = updateServiceEntrySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const ownerId = getSessionOwnerId(authResult.session);
    const existing = await getServiceEntryById(ownerId, body.id);

    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const highestOdometer = await getHighestOdometer("service_entries", ownerId, body.id);
    const odometerError = validateOdometerMonotonicity(
      [highestOdometer],
      body.odometer,
    );

    if (odometerError) {
      return NextResponse.json({ message: odometerError }, { status: 400 });
    }

    const updatedAt = new Date().toISOString();
    const entry: ServiceEntry = {
      ...existing,
      date: body.date,
      odometer: body.odometer,
      total_cost: body.total_cost,
      service_type: body.service_type,
      location: body.location || "",
      next_service_odometer: body.next_service_odometer,
      notes: body.notes || "",
      updated_at: updatedAt,
    };

    await updateServiceEntryRecord(ownerId, entry);

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/service");
    revalidatePath("/");

    return NextResponse.json({ entry });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update service entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("delete service entries");

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

    const deleted = await deleteServiceEntryRecord(
      getSessionOwnerId(authResult.session),
      entryId,
    );

    if (!deleted) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/service");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete service entry" },
      { status: 500 },
    );
  }
}
