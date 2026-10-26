import { NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";

export async function GET() {
  const authResult = await requireSession();

  if (!authResult.ok) {
    return authResult.response;
  }

  return NextResponse.json({
    ok: true,
    message: "Receipt uploads now use Supabase Storage. No Google Drive check is required.",
  });
}
