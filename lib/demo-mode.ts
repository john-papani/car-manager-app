import type { Session } from "next-auth";

export const DEMO_ACCOUNT_ID = "demo-user";
export const DEMO_ACCOUNT_EMAIL = "user@local.demo";

export function isDemoLoginEnabled() {
  if (process.env.ENABLE_DEMO_LOGIN === "true") {
    return true;
  }

  if (process.env.ENABLE_DEMO_LOGIN === "false") {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}

export function isDemoSession(session: Session | null | undefined) {
  return (
    session?.user?.id === DEMO_ACCOUNT_ID ||
    session?.user?.email === DEMO_ACCOUNT_EMAIL
  );
}

export function getDemoReadOnlyMessage(resource: string) {
  return `Demo account is read-only. Sign in with Google to ${resource}.`;
}
