import { NextResponse } from "next/server";
import { auth, type AppSession } from "@/auth";

export type SessionAuthResult =
  | { ok: true; session: AppSession }
  | { ok: false; response: NextResponse };

export async function requireSession(): Promise<SessionAuthResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, session };
}

export async function requireWritableSession(
  action?: string,
): Promise<SessionAuthResult> {
  void action;
  return requireSession();
}
