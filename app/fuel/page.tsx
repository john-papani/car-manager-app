import { Suspense } from "react";
import { auth } from "@/auth";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import EmptyState from "@/components/EmptyState";
import FuelPageFeedback from "@/components/FuelPageFeedback";
import MiniStat from "@/components/MiniStat";
import PageHeader from "@/components/PageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import { getCurrentFuelEntries } from "@/lib/current-user-data";
import {
  calculateConsumption,
  calculateCostPerKm,
  calculateFuelStats,
} from "@/lib/fuel-calculations";
import type { FuelEntry } from "@/types/car";

async function FuelContent() {
  const session = await auth();
  let entries: FuelEntry[] = [];

  try {
    entries = await getCurrentFuelEntries(session);
  } catch (error) {
    console.error("Failed to load fuel history", error);
  }

  entries = entries.sort((a, b) => b.odometer - a.odometer);
  const stats = calculateFuelStats(entries);

  const chronologicalEntries = [...entries].sort(
    (a, b) => a.odometer - b.odometer,
  );

  const previousById = new Map<string, FuelEntry | undefined>();
  for (let index = 0; index < chronologicalEntries.length; index += 1) {
    previousById.set(
      chronologicalEntries[index].id,
      index > 0 ? chronologicalEntries[index - 1] : undefined,
    );
  }

  return (
    <PageMain>
      <FuelPageFeedback />

      <PageHeader
        eyebrow="Καύσιμα"
        title="Ιστορικό γεμισμάτων"
        description="Όλα τα γεμίσματα, η κατανάλωση και το κόστος ανά χιλιόμετρο σε μία λίστα."
        actionHref="/fuel/new"
        actionLabel="+ Νέο"
      />

      {entries.length > 0 ? (
        <section className="mt-5 grid grid-cols-2 gap-3">
          <MiniStat label="Γεμίσματα" value={String(entries.length)} />
          <MiniStat label="Σύνολο" value={`${stats.totalCost.toFixed(2)}€`} />
          <MiniStat
            label="Μέση κατανάλωση"
            value={
              stats.consumptionSamples > 0
                ? `${stats.averageConsumption.toFixed(2)} L/100`
                : "—"
            }
          />
          <MiniStat
            label="Μέση τιμή"
            value={`${stats.averagePricePerLiter.toFixed(3)}€/L`}
          />
        </section>
      ) : null}

      <section className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <EmptyState
            title="Δεν έχεις ακόμα γεμίσματα"
            description="Πρόσθεσε το πρώτο για να ξεκινήσουν τα στατιστικά κατανάλωσης."
            actionHref="/fuel/new"
            actionLabel="Πρώτο γέμισμα"
          />
        ) : (
          entries.map((entry) => {
            const previousEntry = previousById.get(entry.id);
            const consumption = calculateConsumption(entry, previousEntry);
            const costPerKm = calculateCostPerKm(entry, previousEntry);

            return (
              <article
                key={entry.id}
                className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[var(--muted)]">{entry.date}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {entry.total_cost.toFixed(2)}€
                    </h2>
                  </div>

                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                    {entry.price_per_liter.toFixed(3)}€/L
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-[var(--muted)]">
                    {entry.station || "Χωρίς πρατήριο"}
                  </p>
                  <DeleteEntryButton
                    entryId={entry.id}
                    endpoint="/api/fuel"
                    confirmMessage="Να διαγραφεί αυτή η καταχώρηση καυσίμου;"
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[1.35rem] bg-white/70 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                      Km
                    </p>
                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {entry.odometer.toLocaleString("el-GR")}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-white/70 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                      Λίτρα
                    </p>
                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {entry.liters.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-[var(--accent-soft)]/50 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--accent-strong)]">
                      L/100km
                    </p>
                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {consumption ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3 text-sm text-[var(--muted)]">
                  {entry.receipt_url ? (
                    <a
                      href={entry.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[var(--accent-strong)]"
                    >
                      Απόδειξη
                    </a>
                  ) : null}
                  <span>{costPerKm ? `${costPerKm}€/km` : "—€/km"}</span>
                </div>
              </article>
            );
          })
        )}
      </section>
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
