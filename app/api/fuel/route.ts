import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import {
  appendRow,
  deleteRowById,
  getCachedRows,
  getSheetCacheTag,
} from "@/lib/sheets";
import { isFuelEntryValid, mapRowToFuelEntry } from "@/lib/fuel-entry";
import type { CreateFuelEntryInput, FuelEntry } from "@/types/car";

const SHEET_NAME = "fuel_entries";

export async function GET() {
  try {
    const rows = await getCachedRows(SHEET_NAME);

    const entries = rows
      .map(mapRowToFuelEntry)
      .filter(isFuelEntryValid)
      .sort((a, b) => b.odometer - a.odometer);

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
    revalidatePath("/");
    revalidatePath("/fuel");

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create fuel entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const entryId = request.nextUrl.searchParams.get("id") ?? "";

    if (!entryId) {
      return NextResponse.json(
        { message: "Missing entry id" },
        { status: 400 }
      );
    }

    const deleted = await deleteRowById(SHEET_NAME, entryId);

    if (!deleted) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
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
