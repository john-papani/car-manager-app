import Link from "next/link";
import { getCachedRows } from "@/lib/sheets";
import { isExpenseEntryValid, mapRowToExpenseEntry } from "@/lib/expense-entry";

export default async function ExpensesPage() {
  let rows: Record<string, string>[] = [];

  try {
    rows = await getCachedRows("expense_entries");
  } catch (error) {
    console.error("Failed to load expense history", error);
  }

  const entries = rows
    .map(mapRowToExpenseEntry)
    .filter(isExpenseEntryValid)
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      return dateCompare !== 0 ? dateCompare : b.created_at.localeCompare(a.created_at);
    });

  const totalCost = entries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const categories = new Set(entries.map((entry) => entry.category)).size;
  const latestEntry = entries[0];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-5 pb-32">
      <section className="rounded-[1.9rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_48%,#ca6f3d_155%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.2)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
              Οικονομικά
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Έξοδα
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Ασφάλεια, διόδια, parking και κάθε άλλο κόστος εκτός καυσίμων.
            </p>
          </div>

          <Link
            href="/expenses/new"
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold !text-[var(--navy)] shadow-[0_14px_28px_rgb(255_255_255_/_0.18)]"
          >
            + Νέο
          </Link>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Σύνολο
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {totalCost.toFixed(2)}€
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Κατηγορίες
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {categories}
          </p>
        </div>
      </section>

      {latestEntry ? (
        <section className="mt-5 rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Τελευταίο έξοδο
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {latestEntry.category}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {latestEntry.date} · {latestEntry.total_cost.toFixed(2)}€
            {latestEntry.vendor ? ` · ${latestEntry.vendor}` : ""}
          </p>
        </section>
      ) : null}

      <section className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-[1.9rem] border border-dashed border-[var(--line)] bg-[var(--card)] p-6 text-center shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
            <p className="font-semibold text-[var(--foreground)]">
              Δεν υπάρχουν ακόμα καταχωρήσεις εξόδων.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Πρόσθεσε το πρώτο έξοδο για να αρχίσει να χτίζεται το οικονομικό
              ιστορικό.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">{entry.date}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {entry.category}
                  </h2>
                </div>

                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                  {entry.total_cost.toFixed(2)}€
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-[1.35rem] bg-white/70 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                    Σημείο
                  </p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {entry.vendor || "—"}
                  </p>
                </div>

                <div className="rounded-[1.35rem] bg-white/70 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                    Km
                  </p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {entry.odometer
                      ? entry.odometer.toLocaleString("el-GR")
                      : "—"}
                  </p>
                </div>
              </div>

              {entry.notes ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  {entry.notes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
