import { NextResponse } from "next/server";

function unsupported() {
  return NextResponse.json(
    { message: "NextAuth route is no longer used. Authentication now runs through Supabase Auth." },
    { status: 410 },
  );
}

export const GET = unsupported;
export const POST = unsupported;
