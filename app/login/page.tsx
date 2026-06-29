import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import { isDemoLoginEnabled } from "@/lib/demo-mode";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M21.805 10.023h-9.81v3.955h5.623c-.242 1.273-.968 2.352-2.062 3.079v2.56h3.338c1.954-1.798 3.08-4.446 3.08-7.617 0-.654-.058-1.283-.169-1.977Z"
        fill="#4285F4"
      />
      <path
        d="M11.995 22c2.79 0 5.13-.925 6.84-2.502l-3.338-2.56c-.925.62-2.109.986-3.502.986-2.693 0-4.976-1.817-5.79-4.26H2.758v2.641A10.327 10.327 0 0 0 11.995 22Z"
        fill="#34A853"
      />
      <path
        d="M6.205 13.664A6.205 6.205 0 0 1 5.88 11.99c0-.58.105-1.14.325-1.674V7.675H2.758A10.328 10.328 0 0 0 1.668 11.99c0 1.65.395 3.212 1.09 4.315l3.447-2.641Z"
        fill="#FBBC05"
      />
      <path
        d="M11.995 6.056c1.518 0 2.88.522 3.955 1.547l2.967-2.967C17.12 2.958 14.781 2 11.995 2 7.962 2 4.46 4.31 2.758 7.675l3.447 2.641c.814-2.443 3.097-4.26 5.79-4.26Z"
        fill="#EA4335"
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
  const demoEnabled = isDemoLoginEnabled();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
      <section className="relative w-full overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.88),rgb(247_240_231_/_0.96))] p-6 shadow-[0_24px_60px_rgb(18_49_59_/_0.12)] backdrop-blur">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgb(202_111_61_/_0.14)] blur-2xl" />
        <div className="absolute -left-10 bottom-4 h-24 w-24 rounded-full bg-[rgb(18_49_59_/_0.08)] blur-2xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Car Manager
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Σύνδεση
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {demoEnabled
              ? "Demo για γρήγορη δοκιμή, ή Google για Drive και αποδείξεις."
              : "Συνέχισε με Google για Drive και αποδείξεις."}
          </p>
        </div>

        {params.error ? (
          <div className="relative mt-5 rounded-[1.25rem] border border-[rgb(202_111_61_/_0.24)] bg-[rgb(202_111_61_/_0.08)] px-4 py-3 text-sm text-[var(--foreground)]">
            {params.error === "credentials"
              ? "Λάθος username ή password. Δοκίμασε user / user."
              : "Η σύνδεση δεν ολοκληρώθηκε. Δοκίμασε ξανά."}
          </div>
        ) : null}

        {demoEnabled ? (
        <div className="relative mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Demo λογαριασμός
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Username: <strong>user</strong> · Password: <strong>user</strong>
            </p>
          </div>

          <form
            action={async (formData) => {
              "use server";

              try {
                await signIn("credentials", {
                  username: String(formData.get("username") ?? "").trim(),
                  password: String(formData.get("password") ?? ""),
                  redirectTo: "/",
                });
              } catch (error) {
                if (error instanceof AuthError) {
                  redirect("/login?error=credentials");
                }

                throw error;
              }
            }}
            className="mt-5 space-y-3"
          >
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue="user"
                className="w-full rounded-[1rem] border border-[var(--line)] bg-white px-3.5 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                defaultValue="user"
                className="w-full rounded-[1rem] border border-[var(--line)] bg-white px-3.5 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <AuthSubmitButton
              pendingLabel="Σύνδεση..."
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_10px_24px_rgb(18_49_59_/_0.06)] transition hover:bg-[rgb(255_251_246_/_0.95)]"
            >
              Σύνδεση με demo
            </AuthSubmitButton>
          </form>
        </div>
        ) : null}

        <div className={`relative rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-4 ${demoEnabled ? "mt-4" : "mt-6"}`}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--navy)] text-white">
              <GoogleIcon />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Google λογαριασμός
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Για αποθήκευση αποδείξεων στο Google Drive.
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
            className="mt-5"
          >
            <AuthSubmitButton
              pendingLabel="Μετάβαση..."
              className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[var(--navy)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgb(18_49_59_/_0.16)] transition hover:bg-[rgb(18_49_59_/_0.94)]"
            >
              <GoogleIcon />
              Συνέχεια με Google
            </AuthSubmitButton>
          </form>
        </div>
      </section>
    </main>
  );
}
