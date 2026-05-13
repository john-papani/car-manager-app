import Link from "next/link";
import { getCachedRows } from "@/lib/sheets";
import { isFuelEntryValid, mapRowToFuelEntry } from "@/lib/fuel-entry";
import {
  calculateConsumption,
  calculateCostPerKm,
} from "@/lib/fuel-calculations";

export default async function FuelPage() {
  let rows: Record<string, string>[] = [];

  try {
    rows = await getCachedRows("fuel_entries");
  } catch (error) {
    console.error("Failed to load fuel history", error);
  }

  const entries = rows
    .map(mapRowToFuelEntry)
    .filter(isFuelEntryValid)
    .sort((a, b) => b.odometer - a.odometer);

  const chronologicalEntries = [...entries].sort(
    (a, b) => a.odometer - b.odometer
  );

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5 pb-32">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Ιστορικό
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Καύσιμα
          </h1>
        </div>

        <Link
          href="/fuel/new"
          className="rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold !text-white shadow-[0_14px_28px_rgb(18_49_59_/_0.16)] "
        >
          + Νέο
        </Link>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-[1.9rem] border border-dashed border-[var(--line)] bg-[var(--card)] p-6 text-center shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
            <p className="font-semibold text-[var(--foreground)]">
              Δεν έχεις ακόμα καταχωρήσεις.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Πρόσθεσε το πρώτο γέμισμα για να αρχίσουν να εμφανίζονται οι
              μετρήσεις κατανάλωσης.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const currentIndex = chronologicalEntries.findIndex(
              (item) => item.id === entry.id
            );

            const previousEntry =
              currentIndex > 0 ? chronologicalEntries[currentIndex - 1] : undefined;

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

                  <div className="rounded-[1.35rem] bg-white/70 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                      L/100km
                    </p>
                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {consumption ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                  <span>{entry.station || "Χωρίς πρατήριο"}</span>
                  <span>{costPerKm ? `${costPerKm}€/km` : "—€/km"}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
