import { Suspense } from "react";
import { auth } from "@/auth";
import DataHealthBanner from "@/components/DataHealthBanner";
import DataLoadError from "@/components/DataLoadError";
import EmptyState from "@/components/EmptyState";
import ExpenseEntryList from "@/components/ExpenseEntryList";
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

  return (
    <PageMain>
      <PageHeader
        eyebrow="Οικονομικά"
        title="Έξοδα"
        description="Ασφάλεια, διόδια, parking και κάθε άλλο κόστος εκτός καυσίμων."
        actionHref="/expenses/new"
        actionLabel="+ Νέο"
        compact
      />

      {loadFailed ? <DataLoadError /> : null}
      <DataHealthBanner invalidRowCount={invalidRowCount} />

      {entries.length > 0 ? (
        <section className="mt-3 grid grid-cols-2 border-y border-[var(--line)] py-2 text-center">
          <div>
            <p className="text-[11px] text-[var(--muted)]">Σύνολο</p>
            <p className="font-semibold">{totalCost.toFixed(2)}€</p>
          </div>
          <div className="border-l border-[var(--line)]">
            <p className="text-[11px] text-[var(--muted)]">Κατηγορίες</p>
            <p className="font-semibold">{categories}</p>
          </div>
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
