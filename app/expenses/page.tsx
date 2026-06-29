import { Suspense } from "react";
import { auth } from "@/auth";
import DataHealthBanner from "@/components/DataHealthBanner";
import DataLoadError from "@/components/DataLoadError";
import EmptyState from "@/components/EmptyState";
import ExpenseEntryList from "@/components/ExpenseEntryList";
import MiniStat from "@/components/MiniStat";
import PageHeader from "@/components/PageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import { getCurrentExpenseEntriesWithHealth } from "@/lib/current-user-data";
import type { ExpenseEntry } from "@/types/car";

async function ExpensesContent() {
  const session = await auth();
  let entries: ExpenseEntry[] = [];
  let invalidRowCount = 0;
  let loadFailed = false;

  try {
    const result = await getCurrentExpenseEntriesWithHealth(session);
    entries = result.entries;
    invalidRowCount = result.invalidRowCount;
  } catch (error) {
    console.error("Failed to load expense history", error);
    loadFailed = true;
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

      {loadFailed ? <DataLoadError /> : null}
      <DataHealthBanner invalidRowCount={invalidRowCount} />

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

      {entries.length === 0 ? (
        <section className="mt-5">
          <EmptyState
            title="Δεν υπάρχουν έξοδα"
            description="Πρόσθεσε το πρώτο για να βλέπεις πού πηγαίνουν τα χρήματα."
            actionHref="/expenses/new"
            actionLabel="Πρώτο έξοδο"
          />
        </section>
      ) : (
        <ExpenseEntryList entries={entries} />
      )}
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
