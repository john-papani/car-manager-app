import { google } from "googleapis";

function getGoogleCredentials() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google service account credentials");
  }

  // Prevent the placeholder .env value from being parsed as a real key.
  if (privateKey.includes("...")) {
    throw new Error("GOOGLE_PRIVATE_KEY is still using the placeholder value");
  }

  return { clientEmail, privateKey };
}

function getGoogleAuth() {
  const { clientEmail, privateKey } = getGoogleCredentials();

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });
}

export function getSheetsClient() {
  return google.sheets({
    version: "v4",
    auth: getGoogleAuth(),
  });
}

export function getDriveClient() {
  return google.drive({
    version: "v3",
    auth: getGoogleAuth(),
  });
}
