import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import {
  getCurrentExpenseEntriesWithHealth,
  getCurrentFuelEntriesWithHealth,
  getCurrentServiceEntriesWithHealth,
  getCurrentVehicleProfile,
} from "@/lib/current-user-data";
import DataHealthBanner from "@/components/DataHealthBanner";
import DataLoadError from "@/components/DataLoadError";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import CostDonutChart from "@/components/CostDonutChart";
import ServiceReminderBanner from "@/components/ServiceReminderBanner";
import ShareReportButton from "@/components/ShareReportButton";
import {
  getCurrentOdometer,
  getServiceReminder,
} from "@/lib/service-reminders";
import {
  buildPeriodReport,
  getRecentMonthOptions,
} from "@/lib/report-calculations";
import type {
  ExpenseEntry,
  FuelEntry,
  ServiceEntry,
  VehicleProfile,
} from "@/types/car";

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
    console.error("Failed to load dashboard data", error);
    loadFailed = true;
  }

  const vehicleTitle = vehicleProfile
    ? [vehicleProfile.make, vehicleProfile.model, vehicleProfile.trim]
        .filter(Boolean)
        .join(" ")
    : "Το όχημά σου";
  const currentOdometer = getCurrentOdometer(fuelEntries, serviceEntries);
  const serviceReminder = getServiceReminder(serviceEntries, currentOdometer);
  const currentMonth = getRecentMonthOptions(1)[0];
  const monthlyReport = buildPeriodReport(
    currentMonth.key,
    "month",
    fuelEntries,
    expenseEntries,
    serviceEntries,
  );
  const recentFuelEntries = [...fuelEntries]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 3);

  return (
    <PageMain>
      <section className="rounded-[1.75rem] bg-[var(--navy)] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              Car Manager
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight leading-tight">
              {vehicleTitle}
            </h1>
            <p className="mt-3 text-sm font-medium text-white/70">
              {currentOdometer > 0
                ? `${currentOdometer.toLocaleString("el-GR")} km`
                : "Δεν υπάρχουν ακόμη χιλιόμετρα"}
            </p>
          </div>
          <ShareReportButton
            vehicle={vehicleTitle}
            fuelEntries={fuelEntries.map((entry) => ({
              date: entry.date,
              liters: entry.liters,
              total_cost: entry.total_cost,
              odometer: entry.odometer,
            }))}
            expenseEntries={expenseEntries.map((entry) => ({
              date: entry.date,
              total_cost: entry.total_cost,
            }))}
            serviceEntries={serviceEntries.map((entry) => ({
              date: entry.date,
              total_cost: entry.total_cost,
            }))}
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Link
            href="/fuel/new"
            className="flex items-center justify-center rounded-xl bg-white px-4 py-3.5 text-center text-sm font-semibold !text-[var(--navy)]"
          >
            + Καύσιμο
          </Link>

          <Link
            href="/expenses/new"
            className="flex items-center justify-center rounded-xl border border-white/30 px-4 py-3.5 text-center text-sm font-semibold text-white"
          >
            + Έξοδο
          </Link>

          <Link
            href="/service/new"
            className="flex items-center justify-center rounded-xl border border-white/30 px-2 py-3.5 text-center text-sm font-semibold text-white"
          >
            + Service
          </Link>
        </div>
      </section>

      {loadFailed ? <DataLoadError /> : null}
      <DataHealthBanner invalidRowCount={invalidRowCount} />

      {serviceReminder ? (
        <ServiceReminderBanner reminder={serviceReminder} />
      ) : null}

      <section className="mt-5 rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {monthlyReport.label}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Έξοδα του τρέχοντος μήνα ανά κατηγορία.
            </p>
          </div>
          <Link
            href="/expenses"
            className="text-sm font-semibold text-[var(--accent-strong)]"
          >
            Έξοδα
          </Link>
        </div>

        <div className="mt-4">
          <CostDonutChart
            total={monthlyReport.totalCost}
            segments={[
              { label: "Καύσιμα", value: monthlyReport.fuelCost, color: "#ca6f3d" },
              { label: "Service", value: monthlyReport.serviceCost, color: "#16313a" },
              { label: "Λοιπά έξοδα", value: monthlyReport.expenseCost, color: "#d8a27a" },
            ]}
          />
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Τελευταία καυσίμου
          </h2>
          <Link
            href="/fuel"
            className="text-sm font-semibold text-[var(--accent-strong)]"
          >
            Όλες
          </Link>
        </div>

        {recentFuelEntries.length > 0 ? (
          <div className="mt-4 divide-y divide-[var(--line)]">
            {recentFuelEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {entry.station || "Χωρίς πρατήριο"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {entry.date} · {entry.liters.toFixed(2)} L
                  </p>
                </div>
                <p className="shrink-0 text-base font-semibold text-[var(--foreground)]">
                  {entry.total_cost.toFixed(2)}€
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[var(--surface-subtle)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Δεν έχεις καταχωρήσει ακόμη βενζίνη.
            </p>
            <Link
              href="/fuel/new"
              className="mt-3 inline-flex text-sm font-semibold text-[var(--accent-strong)]"
            >
              Πρόσθεσε την πρώτη
            </Link>
          </div>
        )}
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
