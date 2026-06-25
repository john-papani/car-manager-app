import { Suspense } from "react";
import { auth } from "@/auth";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import EmptyState from "@/components/EmptyState";
import MiniStat from "@/components/MiniStat";
import PageHeader from "@/components/PageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import { getCurrentExpenseEntries } from "@/lib/current-user-data";
import type { ExpenseEntry } from "@/types/car";

async function ExpensesContent() {
  const session = await auth();
  let entries: ExpenseEntry[] = [];

  try {
    entries = await getCurrentExpenseEntries(session);
  } catch (error) {
    console.error("Failed to load expense history", error);
  }

  entries = entries.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    return dateCompare !== 0
      ? dateCompare
      : b.created_at.localeCompare(a.created_at);
  });

  const totalCost = entries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const categories = new Set(entries.map((entry) => entry.category)).size;
  const latestEntry = entries[0];

  return (
    <PageMain>
      <PageHeader
        eyebrow="Οικονομικά"
        title="Έξοδα"
        description="Ασφάλεια, διόδια, parking και κάθε άλλο κόστος εκτός καυσίμων."
        actionHref="/expenses/new"
        actionLabel="+ Νέο"
      />

      {entries.length > 0 ? (
        <section className="mt-5 grid grid-cols-2 gap-3">
          <MiniStat label="Σύνολο" value={`${totalCost.toFixed(2)}€`} />
          <MiniStat label="Κατηγορίες" value={String(categories)} />
        </section>
      ) : null}

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
          <EmptyState
            title="Δεν υπάρχουν έξοδα"
            description="Πρόσθεσε το πρώτο για να βλέπεις πού πηγαίνουν τα χρήματα."
            actionHref="/expenses/new"
            actionLabel="Πρώτο έξοδο"
          />
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

              <div className="mt-3 flex justify-end">
                <DeleteEntryButton
                  entryId={entry.id}
                  endpoint="/api/expenses"
                  confirmMessage="Να διαγραφεί αυτό το έξοδο;"
                />
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
    </PageMain>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExpensesContent />
    </Suspense>
  );
}
