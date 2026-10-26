import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getCurrentExpenseEntries } from "@/lib/current-user-data";
import { requireSession, requireWritableSession } from "@/lib/require-session";
import { getSheetCacheTag } from "@/lib/sheets";
import { getSessionOwnerId } from "@/lib/supabase";
import {
  deleteExpenseEntryRecord,
  getExpenseEntryById,
  getHighestOdometer,
  insertExpenseEntry,
  updateExpenseEntryRecord,
} from "@/lib/supabase-data";
import {
  createExpenseEntrySchema,
  formatZodError,
  updateExpenseEntrySchema,
  validateOdometerMonotonicity,
} from "@/lib/validation";
import type { ExpenseEntry } from "@/types/car";

const CACHE_KEY = "expense_entries";

export async function GET() {
  try {
    const authResult = await requireSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    const entries = (await getCurrentExpenseEntries(authResult.session)).sort(
      (a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0
          ? dateCompare
          : b.created_at.localeCompare(a.created_at);
      },
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch expense entries" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("add expense entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = createExpenseEntrySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const ownerId = getSessionOwnerId(authResult.session);

    if (body.odometer !== undefined) {
      const highestOdometer = await getHighestOdometer("expense_entries", ownerId);
      const odometerError = validateOdometerMonotonicity(
        [highestOdometer],
        body.odometer,
      );

      if (odometerError) {
        return NextResponse.json({ message: odometerError }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    const entry: ExpenseEntry = {
      id: uuidv4(),
      date: body.date,
      category: body.category,
      total_cost: body.total_cost,
      odometer: body.odometer,
      vendor: body.vendor || "",
      notes: body.notes || "",
      created_at: now,
      updated_at: now,
    };

    await insertExpenseEntry(ownerId, entry);
    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/expenses");
    revalidatePath("/");

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create expense entry" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("update expense entries");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = updateExpenseEntrySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const ownerId = getSessionOwnerId(authResult.session);
    const existing = await getExpenseEntryById(ownerId, body.id);

    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    if (body.odometer !== undefined) {
      const highestOdometer = await getHighestOdometer(
        "expense_entries",
        ownerId,
        body.id,
      );
      const odometerError = validateOdometerMonotonicity(
        [highestOdometer],
        body.odometer,
      );

      if (odometerError) {
        return NextResponse.json({ message: odometerError }, { status: 400 });
      }
    }

    const updatedAt = new Date().toISOString();
    const entry: ExpenseEntry = {
      ...existing,
      date: body.date,
      category: body.category,
      total_cost: body.total_cost,
      odometer: body.odometer,
      vendor: body.vendor || "",
      notes: body.notes || "",
      updated_at: updatedAt,
    };

    await updateExpenseEntryRecord(ownerId, entry);

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/expenses");
    revalidatePath("/");

    return NextResponse.json({ entry });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update expense entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("delete expense entries");

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

    const deleted = await deleteExpenseEntryRecord(
      getSessionOwnerId(authResult.session),
      entryId,
    );

    if (!deleted) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/expenses");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete expense entry" },
      { status: 500 },
    );
  }
}
