import type { Session } from "next-auth";
import { auth } from "@/auth";

export function isLocalAuthBypassEnabled() {
  return process.env.NODE_ENV === "development" && process.env.AUTH_BYPASS === "true";
}

export async function getAppSession(): Promise<Session | null> {
  if (isLocalAuthBypassEnabled()) {
    return {
      user: { id: "local-dev", name: "Τοπική πρόσβαση" },
      expires: new Date(Date.now() + 86_400_000).toISOString(),
    };
  }

  return auth();
}
