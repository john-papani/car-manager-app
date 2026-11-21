import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getCurrentVehicleDocuments } from "@/lib/current-user-data";
import { requireSession, requireWritableSession } from "@/lib/require-session";
import {
  getSessionOwnerId,
  getSupabaseAdminClient,
  getVehicleDocumentsBucket,
} from "@/lib/supabase";
import {
  deleteVehicleDocumentRecord,
  getVehicleDocumentById,
  insertVehicleDocument,
  updateVehicleDocumentRecord,
} from "@/lib/supabase-data";
import {
  createVehicleDocumentSchema,
  formatZodError,
  updateVehicleDocumentSchema,
} from "@/lib/validation";
import type { VehicleDocument } from "@/types/car";

export async function GET() {
  try {
    const authResult = await requireSession();
    if (!authResult.ok) return authResult.response;

    return NextResponse.json({
      entries: await getCurrentVehicleDocuments(authResult.session),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch vehicle documents" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("add vehicle documents");
    if (!authResult.ok) return authResult.response;

    const parsed = createVehicleDocumentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const entry: VehicleDocument = {
      id: uuidv4(),
      ...parsed.data,
      provider: parsed.data.provider || "",
      notes: parsed.data.notes || "",
      created_at: now,
      updated_at: now,
    };

    await insertVehicleDocument(getSessionOwnerId(authResult.session), entry);
    revalidatePath("/documents");
    revalidatePath("/");
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create vehicle document" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("update vehicle documents");
    if (!authResult.ok) return authResult.response;

    const parsed = updateVehicleDocumentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const ownerId = getSessionOwnerId(authResult.session);
    const existing = await getVehicleDocumentById(ownerId, parsed.data.id);
    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const entry: VehicleDocument = {
      ...existing,
      ...parsed.data,
      provider: parsed.data.provider || "",
      notes: parsed.data.notes || "",
      updated_at: new Date().toISOString(),
    };

    await updateVehicleDocumentRecord(ownerId, entry);
    revalidatePath("/documents");
    revalidatePath("/");
    return NextResponse.json({ entry });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update vehicle document" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("delete vehicle documents");
    if (!authResult.ok) return authResult.response;

    const entryId = request.nextUrl.searchParams.get("id") ?? "";
    if (!entryId) {
      return NextResponse.json({ message: "Missing entry id" }, { status: 400 });
    }

    const ownerId = getSessionOwnerId(authResult.session);
    const existing = await getVehicleDocumentById(ownerId, entryId);
    if (!existing) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const deleted = await deleteVehicleDocumentRecord(ownerId, entryId);
    if (!deleted) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    if (existing.file_path) {
      const { error: storageError } = await getSupabaseAdminClient().storage
        .from(getVehicleDocumentsBucket())
        .remove([existing.file_path]);
      if (storageError) console.error("Document file cleanup failed", storageError);
    }

    revalidatePath("/documents");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete vehicle document" },
      { status: 500 },
    );
  }
}
