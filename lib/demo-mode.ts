import type { Session } from "next-auth";

export const DEMO_ACCOUNT_ID = "demo-user";
export const DEMO_ACCOUNT_EMAIL = "user@local.demo";

export function isDemoSession(session: Session | null | undefined) {
  return (
    session?.user?.id === DEMO_ACCOUNT_ID ||
    session?.user?.email === DEMO_ACCOUNT_EMAIL
  );
}

export function getDemoReadOnlyMessage(resource: string) {
  return `Demo account is read-only. Sign in with Google to ${resource}.`;
}
