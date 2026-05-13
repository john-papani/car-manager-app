import Link from "next/link";
import { getCachedRows } from "@/lib/sheets";
import { isFuelEntryValid, mapRowToFuelEntry } from "@/lib/fuel-entry";
import { calculateFuelStats } from "@/lib/fuel-calculations";
import StatCard from "@/components/StatCard";

export default async function DashboardPage() {
  let rows: Record<string, string>[] = [];

  try {
    rows = await getCachedRows("fuel_entries");
  } catch (error) {
    console.error("Failed to load dashboard fuel entries", error);
  }

  const entries = rows.map(mapRowToFuelEntry).filter(isFuelEntryValid);
  const stats = calculateFuelStats(entries);
  const latestEntry = [...entries].sort((a, b) => b.odometer - a.odometer)[0];

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-5 pb-32">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_52%,#ca6f3d_150%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.28)]">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-[rgb(255_214_183_/_0.16)] blur-3xl" />

        <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
          Car Manager
        </p>
        <h1 className="relative mt-2 text-3xl font-semibold tracking-tight">
          Honda Civic 1.6
        </h1>
        <p className="relative mt-3 max-w-[18rem] text-sm leading-6 text-white/72">
          Όλα τα κόστη και τα γεμίσματα σε μια ήσυχη, καθαρή εικόνα.
        </p>

        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/fuel/new"
            className="rounded-[1.35rem] bg-white px-4 py-3 text-center text-sm font-semibold !text-[var(--navy)] shadow-[0_12px_30px_rgb(255_255_255_/_0.18)]"
          >
            + Νέο γέμισμα
          </Link>

          <Link
            href="/service"
            className="rounded-[1.35rem] border border-white/14 bg-white/8 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur"
          >
            Service
          </Link>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <StatCard
          label="Συνολικό κόστος"
          value={`${stats.totalCost.toFixed(2)} ‚ €`}
          tone="accent"
        />
        <StatCard
          label="Συνολικά λίτρα"
          value={`${stats.totalLiters.toFixed(1)} L`}
        />
        <StatCard
          label="Μέση τιμή"
          value={`${stats.averagePricePerLiter.toFixed(3)}€/L`}
        />
        <StatCard
          label="Τελευταία χλμ"
          value={stats.latestOdometer.toLocaleString("el-GR")}
        />
      </section>

      <section className="mt-5 rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Τελευταίο γέμισμα
          </h2>
          <Link
            href="/fuel"
            className="text-sm font-semibold text-[var(--accent-strong)]"
          >
            Όλα
          </Link>
        </div>

        {latestEntry ? (
          <div className="mt-4">
            <p className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {latestEntry.total_cost.toFixed(2)}€
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {latestEntry.date} · {latestEntry.liters.toFixed(2)} L ·{" "}
              {latestEntry.odometer.toLocaleString("el-GR")} km
            </p>
            <div className="mt-4 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
              {latestEntry.station || "Χωρίς πρατήριο"}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            Δεν υπάρχει ακόμα καταχώρηση. Πρόσθεσε το πρώτο γέμισμα για να
            αρχίσουν να φαίνονται τα στατιστικά.
          </p>
        )}
      </section>
    </main>
  );
}
