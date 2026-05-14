import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserDriveClient } from "@/lib/google";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unknown Drive error";
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return 500;
}

export async function GET() {
  const folderId = process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID;
  const session = await auth();

  if (!folderId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing GOOGLE_DRIVE_RECEIPTS_FOLDER_ID",
      },
      { status: 500 }
    );
  }

  if (!session?.user?.email || !session.accessToken) {
    return NextResponse.json(
      {
        ok: false,
        folder_id: folderId,
        checks: {
          signedIn: false,
          hasAccessToken: false,
          folderVisibleToSignedInUser: false,
        },
        message:
          "Δεν υπάρχει ενεργή Google σύνδεση. Κάνε sign in πρώτα από το app.",
      },
      { status: 401 }
    );
  }

  try {
    const driveClient = getUserDriveClient(session.accessToken);
    const folder = await driveClient.files.get({
      fileId: folderId,
      fields: "id, name, mimeType, driveId, parents, webViewLink",
      supportsAllDrives: true,
    });

    return NextResponse.json({
      ok: true,
      signed_in_google_email: session.user.email,
      folder: {
        id: folder.data.id,
        name: folder.data.name,
        mimeType: folder.data.mimeType,
        driveId: folder.data.driveId ?? null,
        isSharedDriveFolder: Boolean(folder.data.driveId),
        parents: folder.data.parents ?? [],
        webViewLink: folder.data.webViewLink ?? null,
      },
      checks: {
        signedIn: true,
        hasAccessToken: true,
        folderVisibleToSignedInUser: true,
      },
      message: "Ο signed-in χρήστης βλέπει σωστά τον φάκελο.",
    });
  } catch (error) {
    const status = getErrorStatus(error);
    const message = getErrorMessage(error);

    return NextResponse.json(
      {
        ok: false,
        signed_in_google_email: session.user.email,
        folder_id: folderId,
        checks: {
          signedIn: true,
          hasAccessToken: true,
          folderVisibleToSignedInUser: false,
        },
        message,
      },
      { status }
    );
  }
}
