import Link from "next/link";
import { signOut } from "@/auth";

type AuthBannerProps = {
  hasDriveAccess: boolean;
  hasSession: boolean;
  userEmail: string | null;
};

export default async function AuthBanner({
  hasDriveAccess,
  hasSession,
  userEmail,
}: AuthBannerProps) {
  return (
    <div className="mx-auto mb-1 max-w-md px-4 pt-4">
      <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-[var(--line)] bg-[rgb(255_251_246_/_0.88)] px-4 py-3 shadow-[0_12px_30px_rgb(18_49_59_/_0.08)] backdrop-blur">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Supabase Auth
          </p>
          <p className="mt-1 truncate text-sm text-[var(--foreground)]">
            {userEmail || "Δεν υπάρχει σύνδεση"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {hasDriveAccess
              ? "Οι αποδείξεις μπορούν να αποθηκευτούν στο Supabase Storage."
              : "Κάνε σύνδεση για να δουλέψουν τα προσωπικά σου δεδομένα και τα uploads."}
          </p>
        </div>

        {hasSession ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="shrink-0 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--foreground)]"
            >
              Αποσύνδεση
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold text-white"
          >
            Σύνδεση
          </Link>
        )}
      </div>
    </div>
  );
}
