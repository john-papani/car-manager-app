import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

export async function getAuthJwt() {
  const headersList = await headers();

  return getToken({
    secret: process.env.AUTH_SECRET,
    req: {
      headers: Object.fromEntries(headersList.entries()),
    } as Parameters<typeof getToken>[0]["req"],
  });
}

export async function getGoogleAccessToken(): Promise<string | null> {
  const token = await getAuthJwt();
  const accessToken = token?.accessToken;

  return typeof accessToken === "string" ? accessToken : null;
}

export async function getGoogleAuthError(): Promise<string | null> {
  const token = await getAuthJwt();
  const error = token?.error;

  return typeof error === "string" ? error : null;
}

export async function hasGoogleDriveAccess(): Promise<boolean> {
  const token = await getAuthJwt();

  return (
    token?.provider === "google" &&
    typeof token.accessToken === "string" &&
    token.error !== "RefreshAccessTokenError"
  );
}
