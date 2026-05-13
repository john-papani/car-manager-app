import Link from "next/link";
import { getCachedRows } from "@/lib/sheets";
import { isServiceEntryValid, mapRowToServiceEntry } from "@/lib/service-entry";

export default async function ServicePage() {
  let rows: Record<string, string>[] = [];

  try {
    rows = await getCachedRows("service_entries");
  } catch (error) {
    console.error("Failed to load service history", error);
  }

  const entries = rows
    .map(mapRowToServiceEntry)
    .filter(isServiceEntryValid)
    .sort((a, b) => b.odometer - a.odometer);

  const totalCost = entries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const latestEntry = entries[0];
  const upcomingEntry = entries
    .filter((entry) => entry.next_service_odometer)
    .sort(
      (a, b) =>
        (a.next_service_odometer ?? Number.MAX_SAFE_INTEGER) -
        (b.next_service_odometer ?? Number.MAX_SAFE_INTEGER)
    )[0];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-5 pb-32">
      <section className="rounded-[1.9rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_48%,#ca6f3d_155%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.2)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
              Συντήρηση
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Service
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Ιστορικό εργασιών, χιλιόμετρα και υπενθυμίσεις για το επόμενο
              service.
            </p>
          </div>

          <Link
            href="/service/new"
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold !text-[var(--navy)] shadow-[0_14px_28px_rgb(255_255_255_/_0.18)]"
          >
            + Νέο
          </Link>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Εργασίες
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {entries.length}
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Σύνολο
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {totalCost.toFixed(2)}€
          </p>
        </div>
      </section>

      {upcomingEntry ? (
        <section className="mt-5 rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Επόμενο service
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {(upcomingEntry.next_service_odometer ?? 0).toLocaleString("el-GR")} km
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Από την εργασία &quot;{upcomingEntry.service_type}&quot;
            {latestEntry
              ? ` · τώρα είσαι στα ${latestEntry.odometer.toLocaleString("el-GR")} km`
              : ""}
          </p>
        </section>
      ) : null}

      <section className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-[1.9rem] border border-dashed border-[var(--line)] bg-[var(--card)] p-6 text-center shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
            <p className="font-semibold text-[var(--foreground)]">
              Δεν υπάρχουν ακόμα καταχωρήσεις service.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Πρόσθεσε την πρώτη εργασία για να κρατάς οργανωμένο ιστορικό
              συντήρησης.
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
                    {entry.service_type}
                  </h2>
                </div>

                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                  {entry.total_cost.toFixed(2)}€
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
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
                    Επόμενο
                  </p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {entry.next_service_odometer
                      ? entry.next_service_odometer.toLocaleString("el-GR")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-[var(--muted)]">
                <p>{entry.location || "Χωρίς συνεργείο"}</p>
                {entry.notes ? <p>{entry.notes}</p> : null}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
