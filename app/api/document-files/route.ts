import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  isSupportedDocumentFile,
  safeDocumentFileName,
} from "@/lib/document-file";
import { requireWritableSession } from "@/lib/require-session";
import {
  getSessionOwnerId,
  getSupabaseAdminClient,
  getVehicleDocumentsBucket,
} from "@/lib/supabase";
import {
  getVehicleDocumentById,
  updateVehicleDocumentRecord,
} from "@/lib/supabase-data";

const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(request: NextRequest) {
  const authResult = await requireWritableSession("view vehicle documents");
  if (!authResult.ok) return authResult.response;

  const filePath = request.nextUrl.searchParams.get("path") ?? "";
  if (!filePath) {
    return NextResponse.json({ message: "Missing document path" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: document, error: documentError } = await supabase
    .from("vehicle_documents")
    .select("id")
    .eq("owner_id", getSessionOwnerId(authResult.session))
    .eq("file_path", filePath)
    .maybeSingle();

  if (documentError || !document) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(getVehicleDocumentsBucket())
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("upload vehicle documents");
    if (!authResult.ok) return authResult.response;

    const formData = await request.formData();
    const file = formData.get("file");
    const documentId = String(formData.get("document_id") ?? "");

    if (!(file instanceof File) || !documentId) {
      return NextResponse.json(
        { message: "Missing document or file" },
        { status: 400 },
      );
    }

    if (!isSupportedDocumentFile(file)) {
      return NextResponse.json(
        { message: "Επίλεξε PDF ή εικόνα έως 10 MB." },
        { status: 400 },
      );
    }

    const ownerId = getSessionOwnerId(authResult.session);
    const document = await getVehicleDocumentById(ownerId, documentId);
    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    const supabase = getSupabaseAdminClient();
    const bucket = getVehicleDocumentsBucket();
    const filePath = `${ownerId}/${documentId}/${Date.now()}-${safeDocumentFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(
      filePath,
      Buffer.from(await file.arrayBuffer()),
      { contentType: file.type, cacheControl: "3600", upsert: false },
    );

    if (uploadError) throw uploadError;

    try {
      const updated = await updateVehicleDocumentRecord(ownerId, {
        ...document,
        file_path: filePath,
        file_name: file.name,
        updated_at: new Date().toISOString(),
      });
      if (!updated) throw new Error("Document no longer exists");
    } catch (error) {
      await supabase.storage.from(bucket).remove([filePath]);
      throw error;
    }

    if (document.file_path) {
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove([document.file_path]);
      if (removeError) console.error("Old document file cleanup failed", removeError);
    }

    revalidatePath("/documents");
    return NextResponse.json({
      file_path: filePath,
      file_name: file.name,
      url: `/api/document-files?path=${encodeURIComponent(filePath)}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Το αρχείο δεν αποθηκεύτηκε στο Supabase Storage." },
      { status: 500 },
    );
  }
}
