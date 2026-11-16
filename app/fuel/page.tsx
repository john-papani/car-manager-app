import { Suspense } from "react";
import { auth } from "@/auth";
import DataHealthBanner from "@/components/DataHealthBanner";
import DataLoadError from "@/components/DataLoadError";
import EmptyState from "@/components/EmptyState";
import FuelEntryList from "@/components/FuelEntryList";
import FuelPageFeedback from "@/components/FuelPageFeedback";
import PageHeader from "@/components/PageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import { getCurrentFuelEntriesWithHealth } from "@/lib/current-user-data";
import { calculateFuelStats } from "@/lib/fuel-calculations";
import type { FuelEntry } from "@/types/car";

async function FuelContent() {
  const session = await auth();
  let entries: FuelEntry[] = [];
  let invalidRowCount = 0;
  let loadFailed = false;

  try {
    const result = await getCurrentFuelEntriesWithHealth(session);
    entries = result.entries;
    invalidRowCount = result.invalidRowCount;
  } catch (error) {
    console.error("Failed to load fuel history", error);
    loadFailed = true;
  }

  entries = entries.sort((a, b) => b.odometer - a.odometer);
  const stats = calculateFuelStats(entries);

  return (
    <PageMain>
      <FuelPageFeedback />
      <PageHeader
        eyebrow="Καύσιμα"
        title="Ιστορικό γεμισμάτων"
        description="Όλα τα γεμίσματα και η κατανάλωση σε μία λίστα."
        actionHref="/fuel/new"
        actionLabel="+ Νέο"
      />
      {loadFailed ? <DataLoadError /> : null}
      <DataHealthBanner invalidRowCount={invalidRowCount} />
      {entries.length > 0 ? (
        <section className="mt-5 grid grid-cols-3 gap-2 rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-3 text-center">
          <div>
            <p className="text-[11px] text-[var(--muted)]">Γεμίσματα</p>
            <p className="font-semibold">{entries.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--muted)]">Σύνολο</p>
            <p className="font-semibold">{stats.totalCost.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--muted)]">Km αυτοκινήτου</p>
            <p className="font-semibold">
              {entries[0].odometer.toLocaleString("el-GR")}
            </p>
          </div>
        </section>
      ) : null}
      {entries.length === 0 ? (
        <section className="mt-5">
          <EmptyState
            title="Δεν έχεις ακόμα γεμίσματα"
            description="Πρόσθεσε το πρώτο για να ξεκινήσουν τα στατιστικά κατανάλωσης."
            actionHref="/fuel/new"
            actionLabel="Πρώτο γέμισμα"
          />
        </section>
      ) : (
        <FuelEntryList entries={entries} />
      )}
    </PageMain>
  );
}

export default function FuelPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FuelContent />
    </Suspense>
  );
}
