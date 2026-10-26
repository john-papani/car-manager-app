import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("CRON_SECRET is not configured");
    return Response.json({ message: "Cron is not configured" }, { status: 503 });
  }

  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  const received = createHash("sha256").update(authorization).digest();

  if (!timingSafeEqual(received, expected)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await getSupabaseAdminClient()
      .from("vehicle_profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase keep-alive query failed", error);
      return Response.json({ message: "Database check failed" }, { status: 502 });
    }

    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Supabase keep-alive request failed", error);
    return Response.json({ message: "Database check failed" }, { status: 502 });
  }
}
