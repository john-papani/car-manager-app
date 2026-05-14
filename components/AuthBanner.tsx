import { auth, signIn, signOut } from "@/auth";

export default async function AuthBanner() {
  const session = await auth();
  const userEmail = session?.user?.email;
  const hasDriveAccess = Boolean(session?.accessToken) && !session?.error;

  return (
    <div className="mx-auto mb-1 max-w-md px-4 pt-4">
      <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-[var(--line)] bg-[rgb(255_251_246_/_0.88)] px-4 py-3 shadow-[0_12px_30px_rgb(18_49_59_/_0.08)] backdrop-blur">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Google Drive
          </p>
          <p className="mt-1 truncate text-sm text-[var(--foreground)]">
            {userEmail || "Δεν υπάρχει σύνδεση"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {hasDriveAccess
              ? "Οι αποδείξεις θα ανεβαίνουν στο προσωπικό σου Drive."
              : "Συνδέσου με Google για upload αποδείξεων στο προσωπικό σου Drive."}
          </p>
        </div>

        {session?.user ? (
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
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold text-white"
            >
              Σύνδεση
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
