import { NextRequest, NextResponse } from "next/server";
import { requireWritableSession } from "@/lib/require-session";
import {
  getReceiptsBucket,
  getSessionOwnerId,
  getSupabaseAdminClient,
} from "@/lib/supabase";

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60;

function getReceiptFileName(file: File) {
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${timestamp}-${safeName}`;
}

export async function GET(request: NextRequest) {
  const authResult = await requireWritableSession("view receipt images");

  if (!authResult.ok) {
    return authResult.response;
  }

  const filePath = request.nextUrl.searchParams.get("path") ?? "";
  const ownerId = getSessionOwnerId(authResult.session);
  const supabase = getSupabaseAdminClient();
  const { data: receipt, error: receiptError } = await supabase
    .from("fuel_entries")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("receipt_file_id", filePath)
    .maybeSingle();

  if (receiptError || !receipt) {
    return NextResponse.json({ message: "Receipt not found" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(getReceiptsBucket())
    .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Receipt not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("upload receipt images");

    if (!authResult.ok) {
      return authResult.response;
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    if (file.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json(
        { message: "Image must be 8 MB or smaller." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image uploads are supported" },
        { status: 400 },
      );
    }

    const ownerId = getSessionOwnerId(authResult.session);
    const bucket = getReceiptsBucket();
    const filePath = `${ownerId.replace(/[^a-zA-Z0-9._-]/g, "_")}/${getReceiptFileName(file)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = getSupabaseAdminClient();
    const { error: uploadError } = await supabase.storage.from(bucket).upload(
      filePath,
      buffer,
      {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      },
    );

    if (uploadError) {
      throw uploadError;
    }

    return NextResponse.json({
      file_id: filePath,
      url: `/api/receipts?path=${encodeURIComponent(filePath)}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Δεν έγινε upload στο Supabase Storage. Έλεγξε το bucket και τα Supabase env vars.",
      },
      { status: 500 },
    );
  }
}
