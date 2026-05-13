import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/lib/google";
import { Readable } from "stream";

function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(request: NextRequest) {
  try {
    const folderId = process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID;

    if (!folderId) {
      return NextResponse.json(
        { message: "Missing GOOGLE_DRIVE_RECEIPTS_FOLDER_ID" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const driveClient = getDriveClient();

    const response = await driveClient.files.create({
      requestBody: {
        name: `${Date.now()}-${file.name}`,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: bufferToStream(buffer),
      },
      fields: "id, webViewLink",
    });

    return NextResponse.json({
      file_id: response.data.id,
      url: response.data.webViewLink,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to upload receipt" },
      { status: 500 }
    );
  }
}
