import { Suspense } from "react";
import { auth } from "@/auth";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import EmptyState from "@/components/EmptyState";
import MiniStat from "@/components/MiniStat";
import PageHeader from "@/components/PageHeader";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import { getCurrentServiceEntries } from "@/lib/current-user-data";
import type { ServiceEntry } from "@/types/car";

async function ServiceContent() {
  const session = await auth();
  let entries: ServiceEntry[] = [];

  try {
    entries = await getCurrentServiceEntries(session);
  } catch (error) {
    console.error("Failed to load service history", error);
  }

  entries = entries.sort((a, b) => b.odometer - a.odometer);

  const totalCost = entries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const latestEntry = entries[0];
  const upcomingEntry = entries
    .filter((entry) => entry.next_service_odometer)
    .sort(
      (a, b) =>
        (a.next_service_odometer ?? Number.MAX_SAFE_INTEGER) -
        (b.next_service_odometer ?? Number.MAX_SAFE_INTEGER),
    )[0];

  return (
    <PageMain>
      <PageHeader
        eyebrow="Συντήρηση"
        title="Service"
        description="Ιστορικό εργασιών, κόστη και υπενθύμιση για το επόμενο service."
        actionHref="/service/new"
        actionLabel="+ Νέο"
      />

      {entries.length > 0 ? (
        <section className="mt-5 grid grid-cols-2 gap-3">
          <MiniStat label="Εργασίες" value={String(entries.length)} />
          <MiniStat label="Σύνολο" value={`${totalCost.toFixed(2)}€`} />
        </section>
      ) : null}

      {upcomingEntry ? (
        <section className="mt-5 rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Επόμενο service
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {(upcomingEntry.next_service_odometer ?? 0).toLocaleString("el-GR")} km
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Από «{upcomingEntry.service_type}»
            {latestEntry
              ? ` · τώρα στα ${latestEntry.odometer.toLocaleString("el-GR")} km`
              : ""}
          </p>
        </section>
      ) : null}

      <section className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <EmptyState
            title="Δεν υπάρχουν εργασίες service"
            description="Κατέγραψε την πρώτη για να κρατάς οργανωμένο το ιστορικό συντήρησης."
            actionHref="/service/new"
            actionLabel="Πρώτη εργασία"
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
                    {entry.service_type}
                  </h2>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                  {entry.total_cost.toFixed(2)}€
                </span>
              </div>

              <div className="mt-3 flex justify-end">
                <DeleteEntryButton
                  entryId={entry.id}
                  endpoint="/api/service"
                  confirmMessage="Να διαγραφεί αυτή η εργασία service;"
                />
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
    </PageMain>
  );
}

export default function ServicePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ServiceContent />
    </Suspense>
  );
}
