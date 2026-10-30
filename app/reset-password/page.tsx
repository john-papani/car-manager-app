"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [supabase] = useState(createClient);
  const verificationStarted = useRef(false);
  const [recovery, setRecovery] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const tokenHash = params.get("token_hash");
    const code = params.get("code");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
        setChecking(false);
      }
    });
    if (verificationStarted.current) return () => subscription.unsubscribe();
    verificationStarted.current = true;

    if (params.get("error") || params.get("error_code") || hashParams.get("error")) {
      queueMicrotask(() => {
        setError("Ο σύνδεσμος επαναφοράς δεν είναι έγκυρος ή έχει λήξει. Ζήτησε νέο email.");
        setChecking(false);
      });
    } else if (tokenHash && params.get("type") === "recovery") {
      // Remove the one-time token from browser history before showing the form.
      window.history.replaceState({}, "", "/reset-password");
      void supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" }).then(
        ({ error: verifyError }) => {
          if (verifyError) {
            setError("Ο σύνδεσμος έληξε ή έχει ήδη χρησιμοποιηθεί. Ζήτησε νέο email.");
          } else {
            setRecovery(true);
          }
          setChecking(false);
        },
        () => {
          setError("Δεν έγινε επιβεβαίωση του συνδέσμου. Δοκίμασε ξανά.");
          setChecking(false);
        },
      );
    } else if (code) {
      // The default Supabase email uses PKCE; the browser client consumes the code.
      void supabase.auth.getSession().then(
        ({ data, error: sessionError }) => {
          if (!sessionError && data.session && !new URLSearchParams(window.location.search).has("code")) {
            setRecovery(true);
          } else {
            setError("Ο σύνδεσμος δεν επαληθεύτηκε. Άνοιξέ τον στον ίδιο browser όπου ζήτησες το email ή ζήτησε νέο σύνδεσμο.");
          }
          setChecking(false);
        },
        () => {
          setError("Δεν έγινε επιβεβαίωση του συνδέσμου. Δοκίμασε ξανά.");
          setChecking(false);
        },
      );
    } else {
      queueMicrotask(() => setChecking(false));
    }

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPending(false);

    if (requestError) {
      setError(requestError.message);
      return;
    }

    setMessage("Αν υπάρχει λογαριασμός με αυτό το email, θα λάβεις σύνδεσμο επαναφοράς.");
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (password !== confirmation) {
      setError("Οι κωδικοί δεν ταιριάζουν.");
      setPending(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.assign("/login?message=" + encodeURIComponent("Ο κωδικός άλλαξε. Συνδέσου με τον νέο κωδικό."));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
      <section className="w-full rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--surface-shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Car Manager</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          {recovery ? "Νέος κωδικός" : "Επαναφορά κωδικού"}
        </h1>
        {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}
        {message ? <p role="status" className="mt-5 text-sm text-emerald-700">{message}</p> : null}

        {checking ? (
          <p className="mt-6 text-sm text-[var(--muted)]">Έλεγχος συνδέσμου...</p>
        ) : recovery ? (
          <form onSubmit={updatePassword} className="mt-6 space-y-3">
            <label htmlFor="new-password" className="block text-sm font-medium">Νέος κωδικός</label>
            <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={6} required className="w-full rounded-xl border border-[var(--line)] px-3.5 py-3" />
            <label htmlFor="confirm-password" className="block text-sm font-medium">Επιβεβαίωση κωδικού</label>
            <input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" minLength={6} required className="w-full rounded-xl border border-[var(--line)] px-3.5 py-3" />
            <button type="submit" disabled={pending} className="w-full rounded-xl bg-[var(--navy)] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Αποθήκευση..." : "Αλλαγή κωδικού"}
            </button>
          </form>
        ) : (
          <form onSubmit={requestReset} className="mt-6 space-y-3">
            <p className="text-sm text-[var(--muted)]">Γράψε το email του λογαριασμού σου για να λάβεις σύνδεσμο επαναφοράς.</p>
            <label htmlFor="reset-email" className="block text-sm font-medium">Email</label>
            <input id="reset-email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-[var(--line)] px-3.5 py-3" />
            <button type="submit" disabled={pending} className="w-full rounded-xl bg-[var(--navy)] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Αποστολή..." : "Στείλε μου σύνδεσμο"}
            </button>
          </form>
        )}
        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[var(--accent-strong)] hover:underline">Πίσω στη σύνδεση</Link>
      </section>
    </main>
  );
}
