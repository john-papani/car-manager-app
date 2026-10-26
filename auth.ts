import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppSession = {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
};

function mapUserToSession(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      name:
        typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null,
      image:
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null,
    },
  } satisfies AppSession;
}

export async function auth(): Promise<AppSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return mapUserToSession(user);
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();

  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithPassword(
  email: string,
  password: string,
  name?: string,
) {
  const supabase = await createClient();

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
    },
  });
}

export async function signOut(options?: { redirectTo?: string }) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }
}
