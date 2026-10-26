import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppSession } from "@/auth";

let supabaseAdminClient: SupabaseClient | null = null;

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("Missing SUPABASE_URL");
  }

  return url;
}

function getSupabaseServiceRoleKey() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY");
  }

  return key;
}

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey(),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return supabaseAdminClient;
}

export function getReceiptsBucket() {
  return process.env.SUPABASE_RECEIPTS_BUCKET || "fuel-receipts";
}

export function getSessionOwnerId(session: AppSession) {
  const userId = session.user?.id?.trim();

  if (userId) {
    return userId;
  }

  throw new Error("Session user is missing an id");
}
