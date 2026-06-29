import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { getDemoReadOnlyMessage, isDemoSession } from "@/lib/demo-mode";

export type SessionAuthResult =
  | { ok: true; session: Session }
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
  action: string,
): Promise<SessionAuthResult> {
  const result = await requireSession();

  if (!result.ok) {
    return result;
  }

  if (isDemoSession(result.session)) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: getDemoReadOnlyMessage(action) },
        { status: 403 },
      ),
    };
  }

  return result;
}
