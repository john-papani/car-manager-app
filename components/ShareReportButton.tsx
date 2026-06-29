"use client";

import { useMemo, useState } from "react";
import { formInputClass } from "@/components/FormShell";
import {
  buildPeriodReport,
  comparePeriodReports,
  getRecentMonthOptions,
  getRecentYearOptions,
} from "@/lib/report-calculations";

type FuelReportEntry = {
  date: string;
  liters: number;
  total_cost: number;
  odometer: number;
};

type CostReportEntry = {
  date: string;
  total_cost: number;
};

type ShareReportButtonProps = {
  vehicle: string;
  fuelEntries: FuelReportEntry[];
  expenseEntries: CostReportEntry[];
  serviceEntries: CostReportEntry[];
};

function shiftPeriodKey(periodKey: string, mode: "month" | "year") {
  if (mode === "year") {
    return String(Number(periodKey) - 1);
  }

  const [year, month] = periodKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildReportHtml(
  vehicle: string,
  report: ReturnType<typeof buildPeriodReport>,
  comparison: ReturnType<typeof comparePeriodReports> | null,
) {
  const comparisonLine =
    comparison && comparison.percent !== null
      ? `<p class="comparison">${comparison.delta >= 0 ? "+" : ""}${comparison.delta.toFixed(2)}€ vs ${comparison.previousLabel} (${comparison.percent >= 0 ? "+" : ""}${comparison.percent}%)</p>`
      : "";

  return `
    <!doctype html>
    <html lang="el">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Αναφορά ${report.label}</title>
        <style>
          :root {
            color-scheme: light;
            font-family: Arial, sans-serif;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            padding: 32px;
            background: #f5f7fb;
            color: #14213d;
          }

          .report {
            max-width: 720px;
            margin: 0 auto;
            padding: 32px;
            border-radius: 24px;
            background: white;
            box-shadow: 0 20px 60px rgba(20, 33, 61, 0.12);
          }

          h1 { margin: 0 0 8px; font-size: 28px; }
          .subtitle { margin: 0 0 24px; color: #52607a; font-size: 16px; }
          .vehicle {
            margin: 0 0 24px;
            padding: 16px 20px;
            border-radius: 16px;
            background: #eef3ff;
            font-size: 18px;
            font-weight: 700;
          }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .row:last-of-type { border-bottom: 0; }
          .label { color: #52607a; }
          .value { font-weight: 700; }
          .total {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 2px solid #dbe4ff;
            font-size: 22px;
            font-weight: 800;
          }
          .comparison {
            margin: 0 0 24px;
            color: #52607a;
            font-size: 14px;
          }
          .footer {
            margin-top: 24px;
            color: #7b879c;
            font-size: 14px;
            text-align: center;
          }

          @media print {
            body { padding: 0; background: white; }
            .report { max-width: none; border-radius: 0; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <main class="report">
          <h1>Αναφορά Οχήματος</h1>
          <p class="subtitle">Περίοδος: ${report.label}</p>
          ${comparisonLine}
          <p class="vehicle">${vehicle}</p>

          <div class="row">
            <span class="label">Καύσιμα</span>
            <span class="value">${report.fuelCost.toFixed(2)}€ (${report.fuelLiters.toFixed(1)}L)</span>
          </div>
          <div class="row">
            <span class="label">Service</span>
            <span class="value">${report.serviceCost.toFixed(2)}€</span>
          </div>
          <div class="row">
            <span class="label">Λοιπά Έξοδα</span>
            <span class="value">${report.expenseCost.toFixed(2)}€</span>
          </div>
          <div class="row">
            <span class="label">Χιλιόμετρα περιόδου</span>
            <span class="value">${report.kmDriven.toLocaleString("el-GR")} km</span>
          </div>
          <div class="row">
            <span class="label">Κόστος ανά km</span>
            <span class="value">${report.costPerKm !== null ? `${report.costPerKm.toFixed(3)}€/km` : "—"}</span>
          </div>

          <div class="row total">
            <span>Σύνολο</span>
            <span>${report.totalCost.toFixed(2)}€</span>
          </div>

          <p class="footer">car-manager app</p>
        </main>
      </body>
    </html>
  `;
}

export default function ShareReportButton({
  vehicle,
  fuelEntries,
  expenseEntries,
  serviceEntries,
}: ShareReportButtonProps) {
  const monthOptions = useMemo(() => getRecentMonthOptions(), []);
  const yearOptions = useMemo(() => getRecentYearOptions(), []);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"month" | "year">("month");
  const [periodKey, setPeriodKey] = useState(monthOptions[0]?.key ?? "");

  const report = useMemo(
    () =>
      buildPeriodReport(
        periodKey,
        mode,
        fuelEntries,
        expenseEntries,
        serviceEntries,
      ),
    [periodKey, mode, fuelEntries, expenseEntries, serviceEntries],
  );

  const comparison = useMemo(() => {
    const previousKey = shiftPeriodKey(periodKey, mode);
    const previousReport = buildPeriodReport(
      previousKey,
      mode,
      fuelEntries,
      expenseEntries,
      serviceEntries,
    );

    if (previousReport.totalCost <= 0 && report.totalCost <= 0) {
      return null;
    }

    return comparePeriodReports(report, previousReport);
  }, [periodKey, mode, fuelEntries, expenseEntries, serviceEntries, report]);

  const handleExportPdf = () => {
    const reportWindow = window.open("", "_blank", "width=900,height=700");

    if (!reportWindow) {
      alert("Δεν ήταν δυνατό να ανοίξει το παράθυρο εξαγωγής PDF.");
      return;
    }

    reportWindow.document.open();
    reportWindow.document.write(buildReportHtml(vehicle, report, comparison));
    reportWindow.document.close();

    reportWindow.onload = () => {
      reportWindow.focus();
      reportWindow.print();
      reportWindow.close();
    };

    setOpen(false);
  };

  const periodOptions = mode === "month" ? monthOptions : yearOptions;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-sm backdrop-blur-md transition active:scale-90"
        aria-label="Εξαγωγή αναφοράς"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div
            className="w-full max-w-md rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_24px_80px_rgb(18_49_59_/_0.28)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Αναφορά
                </p>
                <h2
                  id="report-dialog-title"
                  className="mt-1 text-xl font-semibold text-[var(--foreground)]"
                >
                  Μηνιαία / ετήσια
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-sm text-[var(--muted)]"
                aria-label="Κλείσιμο"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("month");
                  setPeriodKey(monthOptions[0]?.key ?? "");
                }}
                className={`rounded-full px-3 py-2 text-sm font-semibold ${
                  mode === "month"
                    ? "bg-[var(--navy)] text-white"
                    : "border border-[var(--line)] bg-white"
                }`}
              >
                Μηνιαία
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("year");
                  setPeriodKey(yearOptions[0]?.key ?? "");
                }}
                className={`rounded-full px-3 py-2 text-sm font-semibold ${
                  mode === "year"
                    ? "bg-[var(--navy)] text-white"
                    : "border border-[var(--line)] bg-white"
                }`}
              >
                Ετήσια
              </button>
            </div>

            <label className="mt-4 block text-sm font-medium text-[var(--foreground)]">
              Περίοδος
              <select
                value={periodKey}
                onChange={(event) => setPeriodKey(event.target.value)}
                className={`${formInputClass} mt-1.5 py-2.5 text-sm`}
              >
                {periodOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 space-y-2 rounded-[1.35rem] bg-white/70 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">Σύνολο</span>
                <span className="font-semibold">{report.totalCost.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">Χιλιόμετρα</span>
                <span className="font-semibold">
                  {report.kmDriven.toLocaleString("el-GR")} km
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--muted)]">Κόστος / km</span>
                <span className="font-semibold">
                  {report.costPerKm !== null
                    ? `${report.costPerKm.toFixed(3)}€/km`
                    : "—"}
                </span>
              </div>
              {comparison && comparison.percent !== null ? (
                <div className="flex justify-between gap-3 border-t border-[var(--line)] pt-2">
                  <span className="text-[var(--muted)]">
                    vs {comparison.previousLabel}
                  </span>
                  <span className="font-semibold">
                    {comparison.delta >= 0 ? "+" : ""}
                    {comparison.delta.toFixed(2)}€ ({comparison.percent >= 0 ? "+" : ""}
                    {comparison.percent}%)
                  </span>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--navy)] px-4 py-3 text-sm font-semibold text-white"
            >
              Εξαγωγή PDF
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
