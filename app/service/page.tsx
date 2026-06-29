import { Suspense } from "react";

import { auth } from "@/auth";

import DataHealthBanner from "@/components/DataHealthBanner";

import DataLoadError from "@/components/DataLoadError";

import EmptyState from "@/components/EmptyState";

import MiniStat from "@/components/MiniStat";

import PageHeader from "@/components/PageHeader";

import PageMain from "@/components/PageMain";

import PageSkeleton from "@/components/PageSkeleton";

import ServiceEntryList from "@/components/ServiceEntryList";

import ServiceReminderBanner from "@/components/ServiceReminderBanner";

import {
  getCurrentFuelEntries,
  getCurrentServiceEntriesWithHealth,
} from "@/lib/current-user-data";
import {
  getCurrentOdometer,
  getServiceReminder,
} from "@/lib/service-reminders";

import type { ServiceEntry } from "@/types/car";



async function ServiceContent() {

  const session = await auth();

  let entries: ServiceEntry[] = [];

  let invalidRowCount = 0;

  let loadFailed = false;



  try {

    const result = await getCurrentServiceEntriesWithHealth(session);

    entries = result.entries;

    invalidRowCount = result.invalidRowCount;

  } catch (error) {

    console.error("Failed to load service history", error);

    loadFailed = true;

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



  let serviceReminder = null;



  try {

    const fuelEntries = await getCurrentFuelEntries(session);

    const currentOdometer = getCurrentOdometer(fuelEntries, entries);

    serviceReminder = getServiceReminder(entries, currentOdometer);

  } catch (error) {

    console.error("Failed to load service reminder", error);

  }



  return (

    <PageMain>

      <PageHeader

        eyebrow="Συντήρηση"

        title="Service"

        description="Ιστορικό εργασιών, κόστη και υπενθύμιση για το επόμενο service."

        actionHref="/service/new"

        actionLabel="+ Νέο"

      />



      {loadFailed ? <DataLoadError /> : null}

      <DataHealthBanner invalidRowCount={invalidRowCount} />



      {serviceReminder ? (

        <ServiceReminderBanner reminder={serviceReminder} />

      ) : null}



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



      {entries.length === 0 ? (

        <section className="mt-5">

          <EmptyState

            title="Δεν υπάρχουν εργασίες service"

            description="Κατέγραψε την πρώτη για να κρατάς οργανωμένο το ιστορικό συντήρησης."

            actionHref="/service/new"

            actionLabel="Πρώτη εργασία"

          />

        </section>

      ) : (

        <ServiceEntryList entries={entries} />

      )}

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

