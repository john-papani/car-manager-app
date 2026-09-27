import { Suspense } from "react";
import { getAppSession as auth } from "@/lib/app-session";
import DataHealthBanner from "@/components/DataHealthBanner";
import DataLoadError from "@/components/DataLoadError";
import EmptyState from "@/components/EmptyState";
import FuelEntryList from "@/components/FuelEntryList";
import FuelPageFeedback from "@/components/FuelPageFeedback";
import MiniStat from "@/components/MiniStat";
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
        description="Όλα τα γεμίσματα, τα λίτρα και το κόστος τους σε μία λίστα."
        actionHref="/fuel/new"
        actionLabel="+ Νέο"
      />

      {loadFailed ? <DataLoadError /> : null}
      <DataHealthBanner invalidRowCount={invalidRowCount} />

      {entries.length > 0 ? (
        <section className="mt-5 grid grid-cols-2 gap-3">
          <MiniStat label="Γεμίσματα" value={String(entries.length)} />
          <MiniStat label="Σύνολο" value={`${stats.totalCost.toFixed(2)}€`} />
          <MiniStat
            label="Συνολικά λίτρα"
            value={`${stats.totalLiters.toFixed(2)} L`}
          />
          <MiniStat
            label="Μέση τιμή"
            value={`${stats.averagePricePerLiter.toFixed(3)}€/L`}
          />
        </section>
      ) : null}

      {entries.length === 0 ? (
        <section className="mt-5">
          <EmptyState
            title="Δεν έχεις ακόμα γεμίσματα"
            description="Πρόσθεσε το πρώτο για να οργανώσεις το ιστορικό καυσίμων."
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
