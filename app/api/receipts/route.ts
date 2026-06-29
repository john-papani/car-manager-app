import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import {
  getGoogleAccessToken,
  getGoogleAuthError,
} from "@/lib/auth-server";
import { requireWritableSession } from "@/lib/require-session";
import { getUserDriveClient } from "@/lib/google";

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

function getReceiptFileName(file: File) {
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${timestamp}-${safeName}`;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("upload receipt images");

    if (!authResult.ok) {
      return authResult.response;
    }

    const accessToken = await getGoogleAccessToken();
    const authError = await getGoogleAuthError();

    if (!authResult.session.user?.email || !accessToken) {
      return NextResponse.json(
        {
          message:
            "Συνδέσου με τον Google λογαριασμό σου για να ανεβάζεις αποδείξεις στο προσωπικό σου Drive.",
        },
        { status: 401 },
      );
    }

    if (authError === "RefreshAccessTokenError") {
      return NextResponse.json(
        {
          message:
            "Η σύνδεση με Google έληξε. Κάνε αποσύνδεση και ξανά σύνδεση.",
        },
        { status: 401 },
      );
    }

    const folderId = process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID;

    if (!folderId) {
      return NextResponse.json(
        { message: "Missing GOOGLE_DRIVE_RECEIPTS_FOLDER_ID" },
        { status: 500 },
      );
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

    const driveClient = getUserDriveClient(accessToken);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const response = await driveClient.files.create({
      requestBody: {
        name: getReceiptFileName(file),
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: bufferToStream(buffer),
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    return NextResponse.json({
      file_id: response.data.id,
      url: response.data.webViewLink,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Δεν έγινε upload στο Google Drive. Έλεγξε ότι ο logged-in λογαριασμός βλέπει τον φάκελο και ότι το GOOGLE_DRIVE_RECEIPTS_FOLDER_ID είναι σωστό.",
      },
      { status: 500 },
    );
  }
}
