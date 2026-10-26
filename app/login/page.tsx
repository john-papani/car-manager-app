import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signInWithPassword, signUpWithPassword } from "@/auth";
import AuthSubmitButton from "@/components/AuthSubmitButton";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    mode?: string;
  }>;
};

function KeyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M14 3a7 7 0 0 0-5.58 11.23L2 20.65V22h1.35l1.4-1.4h1.5v-1.5h1.5v-1.5h1.5l1.52-1.52A7 7 0 1 0 14 3Zm0 2a5 5 0 1 1 0 10a5 5 0 0 1 0-10Z"
      />
    </svg>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;
  const isSignUp = params.mode === "signup";

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
      <section className="w-full rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[var(--surface-shadow)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Car Manager
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {isSignUp ? "Δημιουργία λογαριασμού" : "Σύνδεση"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {isSignUp
              ? "Ξεκίνα να κρατάς τα έξοδα του αυτοκινήτου σου σε ένα μέρος."
              : "Τα στοιχεία του αυτοκινήτου σου, με μια ματιά."}
          </p>
        </div>

        {params.error ? (
          <div className="mt-5 rounded-xl border border-[rgb(202_111_61_/_0.24)] bg-[rgb(202_111_61_/_0.08)] px-4 py-3 text-sm text-[var(--foreground)]" role="alert">
            {params.error}
          </div>
        ) : null}

        {params.message ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950" role="status">
            {params.message}
          </div>
        ) : null}

        {!isSignUp ? (
        <div className="mt-6">
          <form
            action={async (formData) => {
              "use server";
              const email = String(formData.get("email") ?? "").trim();
              const password = String(formData.get("password") ?? "");
              const { error } = await signInWithPassword(email, password);

              if (error) {
                redirect(`/login?error=${encodeURIComponent(error.message)}`);
              }

              redirect("/");
            }}
            className="space-y-3"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-base text-[var(--foreground)] focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
              >
                Κωδικός
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-base text-[var(--foreground)] focus:border-[var(--accent)]"
                required
              />
            </div>

            <AuthSubmitButton
              pendingLabel="Σύνδεση..."
              className="w-full rounded-xl bg-[var(--navy)] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--foreground)]"
            >
              Σύνδεση
            </AuthSubmitButton>
          </form>
          <Link
            href="/reset-password"
            className="mt-4 block text-center text-sm font-semibold text-[var(--accent-strong)] hover:underline"
          >
            Ξέχασες τον κωδικό σου;
          </Link>
        </div>
        ) : (
        <div className="mt-6">
          <form
            action={async (formData) => {
              "use server";
              const name = String(formData.get("signup_name") ?? "").trim();
              const email = String(formData.get("signup_email") ?? "").trim();
              const password = String(formData.get("signup_password") ?? "");
              const { data, error } = await signUpWithPassword(email, password, name);

              if (error) {
                redirect(`/login?mode=signup&error=${encodeURIComponent(error.message)}`);
              }

              if (data.session) {
                redirect("/");
              }

              redirect(
                `/login?message=${encodeURIComponent(
                  "Ο λογαριασμός δημιουργήθηκε. Αν χρειάζεται επιβεβαίωση email, άνοιξε το μήνυμα που σου στείλαμε πριν συνδεθείς.",
                )}`,
              );
            }}
            className="space-y-3"
          >
            <label htmlFor="signup_name" className="block text-xs font-semibold text-[var(--muted)]">Όνομα</label>
            <input id="signup_name" name="signup_name" type="text" autoComplete="name" className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-base" />
            <label htmlFor="signup_email" className="block text-xs font-semibold text-[var(--muted)]">Email</label>
            <input
              id="signup_email"
              name="signup_email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-base"
              required
            />
            <label htmlFor="signup_password" className="block text-xs font-semibold text-[var(--muted)]">Κωδικός</label>
            <input
              id="signup_password"
              name="signup_password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-base"
              required
            />
            <AuthSubmitButton
              pendingLabel="Δημιουργία..."
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--navy)] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--foreground)]"
            >
              <KeyIcon />
              Δημιουργία λογαριασμού
            </AuthSubmitButton>
          </form>
        </div>
        )}
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          {isSignUp ? "Έχεις ήδη λογαριασμό; " : "Δεν έχεις λογαριασμό; "}
          <Link href={isSignUp ? "/login" : "/login?mode=signup"} className="font-semibold text-[var(--accent-strong)] hover:underline">
            {isSignUp ? "Σύνδεση" : "Δημιουργία λογαριασμού"}
          </Link>
        </p>
      </section>
    </main>
  );
}
