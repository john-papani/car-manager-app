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
import {
  calculateFuelStats,
  getRecentConsumptionTrend,
} from "@/lib/fuel-calculations";
import StatCard from "@/components/StatCard";
import PageMain from "@/components/PageMain";
import PageSkeleton from "@/components/PageSkeleton";
import ConsumptionBarChart from "@/components/ConsumptionBarChart";
import CostDonutChart from "@/components/CostDonutChart";
import ServiceReminderBanner from "@/components/ServiceReminderBanner";
import ShareReportButton from "@/components/ShareReportButton";
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

  const stats = calculateFuelStats(fuelEntries);
  const latestEntry = [...fuelEntries].sort((a, b) => b.odometer - a.odometer)[0];
  const consumptionTrend = getRecentConsumptionTrend(fuelEntries);
  const serviceTotal = serviceEntries.reduce(
    (sum, entry) => sum + entry.total_cost,
    0
  );
  const expensesTotal = expenseEntries.reduce(
    (sum, entry) => sum + entry.total_cost,
    0
  );
  const totalSpend = stats.totalCost + serviceTotal + expensesTotal;
  const vehicleTitle = vehicleProfile
    ? [vehicleProfile.make, vehicleProfile.model, vehicleProfile.trim]
        .filter(Boolean)
        .join(" ")
    : "Το όχημά σου";
  const currentOdometer = getCurrentOdometer(fuelEntries, serviceEntries);
  const serviceReminder = getServiceReminder(serviceEntries, currentOdometer);

  return (
    <PageMain>
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_52%,#ca6f3d_150%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.28)]">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 left-8 h-36 w-36 rounded-full bg-[rgb(255_214_183_/_0.12)] blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              Car Manager
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight leading-tight">
              {vehicleTitle}
            </h1>
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

        <p className="relative mt-3 max-w-[18rem] text-sm font-medium leading-relaxed text-white/80">
          Όλα τα κόστη και τα γεμίσματα σε μία καθαρή εικόνα.
        </p>

        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/fuel/new"
            className="flex items-center justify-center rounded-2xl bg-white px-4 py-3.5 text-center text-sm font-bold !text-[var(--navy)] shadow-lg active:scale-95"
          >
            + Γέμισμα
          </Link>

          <Link
            href="/expenses/new"
            className="flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-center text-sm font-bold text-white backdrop-blur-md active:scale-95"
          >
            + Έξοδο
          </Link>
        </div>
      </section>

      {loadFailed ? <DataLoadError /> : null}
      <DataHealthBanner invalidRowCount={invalidRowCount} />

      {serviceReminder ? (
        <ServiceReminderBanner reminder={serviceReminder} />
      ) : null}

      <section className="mt-5 grid grid-cols-2 gap-3">
        <StatCard
          label="Συνολικό κόστος"
          value={`${stats.totalCost.toFixed(2)} €`}
          tone="accent"
        />
        <StatCard label="Συνολικά λίτρα" value={`${stats.totalLiters.toFixed(1)} L`} />
        <StatCard
          label="Μέση κατανάλωση"
          value={
            stats.consumptionSamples > 0
              ? `${stats.averageConsumption.toFixed(2)} L/100km`
              : "—"
          }
        />
        <StatCard
          label="Μέση τιμή / λίτρο"
          value={`${stats.averagePricePerLiter.toFixed(3)}€/L`}
        />
      </section>

      <section className="mt-5 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--surface-shadow)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Κατανάλωση
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Μέση τιμή από τα τελευταία γεμίσματα full tank.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Μέσος όρος
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
              {stats.consumptionSamples > 0
                ? `${stats.averageConsumption.toFixed(2)}`
                : "—"}
            </p>
            <p className="text-xs text-[var(--muted)]">L/100km</p>
          </div>
        </div>

        <div className="mt-4">
          <ConsumptionBarChart points={consumptionTrend} />
        </div>
      </section>

      <section className="mt-5 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--surface-shadow)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Κατανομή κόστους
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Πού φεύγουν τα περισσότερα χρήματα συνολικά.
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
            total={totalSpend}
            segments={[
              { label: "Καύσιμα", value: stats.totalCost, color: "#ca6f3d" },
              { label: "Service", value: serviceTotal, color: "#16313a" },
              { label: "Λοιπά έξοδα", value: expensesTotal, color: "#d8a27a" },
            ]}
          />
        </div>
      </section>

      <section className="mt-5 rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--surface-shadow)] backdrop-blur-md">
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
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {latestEntry.date} · {latestEntry.liters.toFixed(2)} L ·{" "}
              {latestEntry.odometer.toLocaleString("el-GR")} km
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                {latestEntry.station || "Χωρίς πρατήριο"}
              </div>
              {latestEntry.receipt_url ? (
                <a
                  href={latestEntry.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                >
                  Απόδειξη
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Πρόσθεσε το πρώτο γέμισμα για να εμφανιστούν τα στατιστικά.
            </p>
            <Link
              href="/fuel/new"
              className="mt-4 inline-flex rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold !text-white"
            >
              Πρώτο γέμισμα
            </Link>
          </>
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
