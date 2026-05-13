import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import {
  appendRow,
  deleteRowById,
  getCachedRows,
  getSheetCacheTag,
} from "@/lib/sheets";
import { isExpenseEntryValid, mapRowToExpenseEntry } from "@/lib/expense-entry";
import type { CreateExpenseEntryInput, ExpenseEntry } from "@/types/car";

const SHEET_NAME = "expense_entries";

export async function GET() {
  try {
    const rows = await getCachedRows(SHEET_NAME);

    const entries = rows
      .map(mapRowToExpenseEntry)
      .filter(isExpenseEntryValid)
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0 ? dateCompare : b.created_at.localeCompare(a.created_at);
      });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch expense entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateExpenseEntryInput;

    if (!body.date || !body.category || body.total_cost === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const entry: ExpenseEntry = {
      id: uuidv4(),
      date: body.date,
      category: body.category,
      total_cost: Number(body.total_cost),
      odometer: body.odometer ? Number(body.odometer) : undefined,
      vendor: body.vendor || "",
      notes: body.notes || "",
      created_at: now,
      updated_at: now,
    };

    await appendRow(SHEET_NAME, [
      entry.id,
      entry.date,
      entry.category,
      entry.total_cost,
      entry.odometer ?? "",
      entry.vendor,
      entry.notes,
      entry.created_at,
      entry.updated_at,
    ]);
    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
    revalidatePath("/expenses");

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create expense entry" },
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
    revalidatePath("/expenses");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete expense entry" },
      { status: 500 }
    );
  }
}
