import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getCurrentVehicleProfile } from "@/lib/current-user-data";
import { isDemoSession } from "@/lib/demo-mode";
import VehicleProfileForm from "@/components/VehicleProfileForm";

async function AccountContent() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isGoogleAccount = Boolean(session.accessToken) && !session.error;
  const isDemoAccount = isDemoSession(session);
  let profile = null;

  try {
    profile = await getCurrentVehicleProfile(session);
  } catch (error) {
    console.error("Failed to load vehicle profile", error);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6 pb-32">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_52%,#ca6f3d_150%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.24)]">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-[rgb(255_214_183_/_0.16)] blur-3xl" />

        <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
          Account
        </p>
        <h1 className="relative mt-2 text-3xl font-semibold tracking-tight">
          {session.user.name || "User"}
        </h1>
        <p className="relative mt-3 text-sm leading-6 text-white/72">
          {session.user.email || "Signed in user"}
        </p>
      </section>

      <VehicleProfileForm initialProfile={profile} />

      <section className="mt-5 rounded-[1.8rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Session</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {isGoogleAccount
                ? "Connected with Google and ready for Drive sync."
                : "Signed in with local demo account."}
            </p>
            {isDemoAccount ? (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Demo mode loads realistic mock vehicle history and keeps editing disabled.
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
            {isGoogleAccount ? "Google" : "Demo"}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-[1.2rem] bg-[var(--navy)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgb(18_49_59_/_0.16)] transition hover:bg-[rgb(18_49_59_/_0.94)]"
            >
              Έξοδος
            </button>
          </form>

          <Link
            href="/"
            className="block w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)]"
          >
            Επιστροφή στην εφαρμογή
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}
