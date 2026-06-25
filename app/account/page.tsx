import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getCurrentVehicleProfile } from "@/lib/current-user-data";
import { isDemoSession } from "@/lib/demo-mode";
import PageHeader from "@/components/PageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
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
    <PageMain>
      <PageHeader
        eyebrow="Λογαριασμός"
        title={session.user.name || "Χρήστης"}
        description={session.user.email || "Συνδεδεμένος χρήστης"}
      />

      <VehicleProfileForm initialProfile={profile} />

      <section className="mt-5 rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Σύνδεση
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {isGoogleAccount
                ? "Συνδεδεμένος με Google — έτοιμος για Drive και αποδείξεις."
                : "Συνδεδεμένος με demo λογαριασμό."}
            </p>
            {isDemoAccount ? (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Το demo φορτώνει δοκιμαστικά δεδομένα. Η επεξεργασία είναι
                απενεργοποιημένη.
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
              className="w-full rounded-[1.2rem] bg-[var(--navy)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgb(18_49_59_/_0.16)] transition hover:bg-[rgb(18_49_59_/_0.94)]"
            >
              Αποσύνδεση
            </button>
          </form>

          <Link
            href="/"
            className="block w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3.5 text-center text-sm font-semibold text-[var(--foreground)]"
          >
            Επιστροφή στην αρχική
          </Link>
        </div>
      </section>
    </PageMain>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountContent />
    </Suspense>
  );
}
