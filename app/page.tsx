import Link from "next/link";
import { Suspense } from "react";
import { getAppSession as auth } from "@/lib/app-session";
import DataHealthBanner from "@/components/DataHealthBanner";
import DataLoadError from "@/components/DataLoadError";
import CostDonutChart from "@/components/CostDonutChart";
import FuelCostBarChart from "@/components/FuelCostBarChart";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import ServiceReminderBanner from "@/components/ServiceReminderBanner";
import {
  getCurrentFuelEntriesWithHealth,
  getCurrentExpenseEntriesWithHealth,
  getCurrentServiceEntriesWithHealth,
  getCurrentVehicleProfile,
} from "@/lib/current-user-data";
import {
  getCurrentOdometer,
  getServiceReminder,
} from "@/lib/service-reminders";
import type {
  ExpenseEntry,
  FuelEntry,
  ServiceEntry,
  VehicleProfile,
} from "@/types/car";

const dateFormatter = new Intl.DateTimeFormat("el-GR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

async function DashboardContent() {
  const session = await auth();
  let fuelEntries: FuelEntry[] = [];
  let expenseEntries: ExpenseEntry[] = [];
  let serviceEntries: ServiceEntry[] = [];
  let vehicleProfile: VehicleProfile | null = null;
  let invalidRowCount = 0;
  let loadFailed = false;

  try {
    const [fuelResult, expenseResult, serviceResult, profile] = await Promise.all([
      getCurrentFuelEntriesWithHealth(session),
      getCurrentExpenseEntriesWithHealth(session),
      getCurrentServiceEntriesWithHealth(session),
      getCurrentVehicleProfile(session),
    ]);

    fuelEntries = fuelResult.entries;
    expenseEntries = expenseResult.entries;
    serviceEntries = serviceResult.entries;
    vehicleProfile = profile;
    invalidRowCount =
      fuelResult.invalidRowCount +
      expenseResult.invalidRowCount +
      serviceResult.invalidRowCount;
  } catch (error) {
    console.error("Failed to load home screen", error);
    loadFailed = true;
  }

  const latestFuel = [...fuelEntries].sort(
    (left, right) => right.odometer - left.odometer,
  )[0];
  const latestService = [...serviceEntries].sort(
    (left, right) => right.odometer - left.odometer,
  )[0];
  const currentOdometer = getCurrentOdometer(fuelEntries, serviceEntries);
  const serviceReminder = getServiceReminder(serviceEntries, currentOdometer);
  const fuelTotal = fuelEntries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const serviceTotal = serviceEntries.reduce(
    (sum, entry) => sum + entry.total_cost,
    0,
  );
  const expenseTotal = expenseEntries.reduce(
    (sum, entry) => sum + entry.total_cost,
    0,
  );
  const totalCost = fuelTotal + serviceTotal + expenseTotal;
  const vehicleTitle = vehicleProfile
    ? [vehicleProfile.make, vehicleProfile.model, vehicleProfile.trim]
        .filter(Boolean)
        .join(" ")
    : "Το όχημά σου";

  return (
    <PageMain>
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(155deg,#102b34_0%,#214955_72%,#8f5538_145%)] p-4 text-white shadow-[0_20px_56px_rgb(18_49_59_/_0.22)] min-[360px]:p-5">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55">
                Car Manager
              </p>
              <h1 className="mt-1 break-words text-2xl font-semibold leading-tight tracking-tight min-[360px]:text-3xl">
                {vehicleTitle}
              </h1>
            </div>

            {vehicleProfile?.license_plate ? (
              <span className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide">
                {vehicleProfile.license_plate}
              </span>
            ) : (
              <Link
                href="/account"
                className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold"
              >
                Προφίλ
              </Link>
            )}
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-white/60">Τρέχον κοντέρ</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight min-[360px]:text-4xl">
              {currentOdometer > 0
                ? `${currentOdometer.toLocaleString("el-GR")} km`
                : "— km"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Link
              href="/fuel/new"
              className="flex min-h-12 items-center justify-center rounded-xl bg-white px-2 py-3 text-center text-xs font-bold !text-[var(--navy)] min-[360px]:text-sm"
            >
              + Καύσιμα
            </Link>
            <Link
              href="/service/new"
              className="flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center text-xs font-bold min-[360px]:text-sm"
            >
              + Service
            </Link>
            <Link
              href="/expenses/new"
              className="flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center text-xs font-bold min-[360px]:text-sm"
            >
              + Έξοδο
            </Link>
          </div>
        </div>
      </section>

      {loadFailed ? <DataLoadError /> : null}
      <DataHealthBanner invalidRowCount={invalidRowCount} />

      {serviceReminder ? <ServiceReminderBanner reminder={serviceReminder} /> : null}

      <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card-strong)] shadow-[var(--surface-shadow)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3.5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Πρόσφατα</h2>
          <Link href="/fuel" className="text-xs font-semibold text-[var(--accent-strong)]">
            Ιστορικό
          </Link>
        </div>

        {latestFuel || latestService ? (
          <div className="divide-y divide-[var(--line)]">
            {latestFuel ? (
              <Link href="/fuel" className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Τελευταίο γέμισμα</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                    {formatDate(latestFuel.date)}{latestFuel.station ? ` · ${latestFuel.station}` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                  {latestFuel.total_cost.toLocaleString("el-GR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}€
                </p>
              </Link>
            ) : null}

            {latestService ? (
              <Link href="/service" className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Τελευταίο service</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                    {formatDate(latestService.date)} · {latestService.service_type}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-[var(--muted)]" aria-hidden="true">›</span>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="px-4 py-5">
            <p className="text-sm leading-6 text-[var(--muted)]">
              Πρόσθεσε την πρώτη καταχώρηση για να εμφανιστεί εδώ.
            </p>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--surface-shadow)]">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Τελευταία γεμίσματα
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Κόστος καυσίμων
            </h2>
          </div>
          <Link href="/fuel" className="text-xs font-semibold text-[var(--accent-strong)]">
            Όλα
          </Link>
        </div>
        <FuelCostBarChart entries={fuelEntries} />
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--surface-shadow)]">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Συνολική εικόνα
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            Πού πηγαίνουν τα χρήματα
          </h2>
        </div>
        <CostDonutChart
          total={totalCost}
          segments={[
            { label: "Καύσιμα", value: fuelTotal, color: "#ca6f3d" },
            { label: "Service", value: serviceTotal, color: "#16313a" },
            { label: "Έξοδα", value: expenseTotal, color: "#d8a27a" },
          ]}
        />
      </section>
    </PageMain>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
