import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { appendRow, getCachedRows, getSheetCacheTag } from "@/lib/sheets";
import { isServiceEntryValid, mapRowToServiceEntry } from "@/lib/service-entry";
import type { CreateServiceEntryInput, ServiceEntry } from "@/types/car";

const SHEET_NAME = "service_entries";

export async function GET() {
  try {
    const rows = await getCachedRows(SHEET_NAME);

    const entries = rows
      .map(mapRowToServiceEntry)
      .filter(isServiceEntryValid)
      .sort((a, b) => b.odometer - a.odometer);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch service entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateServiceEntryInput;

    if (!body.date || !body.odometer || !body.service_type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const entry: ServiceEntry = {
      id: uuidv4(),
      date: body.date,
      odometer: Number(body.odometer),
      total_cost: Number(body.total_cost ?? 0),
      service_type: body.service_type,
      location: body.location || "",
      next_service_odometer: body.next_service_odometer
        ? Number(body.next_service_odometer)
        : undefined,
      notes: body.notes || "",
      created_at: now,
      updated_at: now,
    };

    await appendRow(SHEET_NAME, [
      entry.id,
      entry.date,
      entry.odometer,
      entry.total_cost,
      entry.service_type,
      entry.location,
      entry.next_service_odometer ?? "",
      entry.notes,
      entry.created_at,
      entry.updated_at,
    ]);
    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/service");

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create service entry" },
      { status: 500 }
    );
  }
}
