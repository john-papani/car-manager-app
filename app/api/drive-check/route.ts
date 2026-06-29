import { NextResponse } from "next/server";
import {
  getGoogleAccessToken,
  hasGoogleDriveAccess,
} from "@/lib/auth-server";
import { isDemoSession } from "@/lib/demo-mode";
import { requireSession } from "@/lib/require-session";
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
  const authResult = await requireSession();

  if (!authResult.ok) {
    return authResult.response;
  }

  const session = authResult.session;

  if (!folderId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing GOOGLE_DRIVE_RECEIPTS_FOLDER_ID",
      },
      { status: 500 },
    );
  }

  if (isDemoSession(session)) {
    return NextResponse.json(
      {
        ok: false,
        folder_id: folderId ?? null,
        checks: {
          signedIn: true,
          hasAccessToken: false,
          folderVisibleToSignedInUser: false,
        },
        message:
          "Demo account uses realistic mock data and does not connect to Google Drive.",
      },
      { status: 200 },
    );
  }

  const accessToken = await getGoogleAccessToken();
  const driveReady = await hasGoogleDriveAccess();

  if (!session.user?.email || !accessToken || !driveReady) {
    return NextResponse.json(
      {
        ok: false,
        folder_id: folderId,
        checks: {
          signedIn: Boolean(session.user),
          hasAccessToken: Boolean(accessToken),
          folderVisibleToSignedInUser: false,
        },
        message:
          "Δεν υπάρχει ενεργή Google σύνδεση. Κάνε sign in πρώτα από το app.",
      },
      { status: 401 },
    );
  }

  try {
    const driveClient = getUserDriveClient(accessToken);
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
      { status },
    );
  }
}
