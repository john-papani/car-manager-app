"use client";

type FuelReportEntry = {
  date: string;
  liters: number;
  total_cost: number;
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


export default function ShareReportButton({
  vehicle,
  fuelEntries,
  expenseEntries,
  serviceEntries,
}: ShareReportButtonProps) {
  const isThisMonth = (dateStr: string, now: Date) => {
    const date = new Date(dateStr);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const handleExportPdf = () => {
    const now = new Date();

    const monthlyFuelEntries = fuelEntries.filter((entry) =>
      isThisMonth(entry.date, now),
    );

    const monthlyExpenseEntries = expenseEntries.filter((entry) =>
      isThisMonth(entry.date, now),
    );

    const monthlyServiceEntries = serviceEntries.filter((entry) =>
      isThisMonth(entry.date, now),
    );

    const data = {
      vehicle,
      month: now.toLocaleString("el-GR", {
        month: "long",
        year: "numeric",
      }),
      fuel: {
        cost: monthlyFuelEntries.reduce(
          (sum, entry) => sum + entry.total_cost,
          0,
        ),
        liters: monthlyFuelEntries.reduce(
          (sum, entry) => sum + entry.liters,
          0,
        ),
      },
      expenses: monthlyExpenseEntries.reduce(
        (sum, entry) => sum + entry.total_cost,
        0,
      ),
      service: monthlyServiceEntries.reduce(
        (sum, entry) => sum + entry.total_cost,
        0,
      ),
    };

    const total = data.fuel.cost + data.expenses + data.service;

    const reportWindow = window.open("", "_blank", "width=900,height=700");

    if (!reportWindow) {
      alert("Δεν ήταν δυνατό να ανοίξει το παράθυρο εξαγωγής PDF.");
      return;
    }

    const reportHtml = `
      <!doctype html>
      <html lang="el">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Αναφορά ${data.month}</title>
          <style>
            :root {
              color-scheme: light;
              font-family: Arial, sans-serif;
            }

            * {
              box-sizing: border-box;
            }

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

            h1 {
              margin: 0 0 8px;
              font-size: 28px;
            }

            .subtitle {
              margin: 0 0 24px;
              color: #52607a;
              font-size: 16px;
            }

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

            .row:last-of-type {
              border-bottom: 0;
            }

            .label {
              color: #52607a;
            }

            .value {
              font-weight: 700;
            }

            .total {
              margin-top: 24px;
              padding-top: 20px;
              border-top: 2px solid #dbe4ff;
              font-size: 22px;
              font-weight: 800;
            }

            .footer {
              margin-top: 24px;
              color: #7b879c;
              font-size: 14px;
              text-align: center;
            }

            @media print {
              body {
                padding: 0;
                background: white;
              }

              .report {
                max-width: none;
                border-radius: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <main class="report">
            <h1>Αναφορά Οχήματος</h1>
            <p class="subtitle">Μήνας: ${data.month}</p>

            <p class="vehicle">${data.vehicle}</p>

            <div class="row">
              <span class="label">Καύσιμα</span>
              <span class="value">${data.fuel.cost.toFixed(2)}€ (${data.fuel.liters.toFixed(1)}L)</span>
            </div>
            <div class="row">
              <span class="label">Service</span>
              <span class="value">${data.service.toFixed(2)}€</span>
            </div>
            <div class="row">
              <span class="label">Λοιπά Έξοδα</span>
              <span class="value">${data.expenses.toFixed(2)}€</span>
            </div>

            <div class="row total">
              <span>Σύνολο</span>
              <span>${total.toFixed(2)}€</span>
            </div>

            <p class="footer">car-manager app</p>
          </main>
        </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();

    reportWindow.onload = () => {
      reportWindow.focus();
      reportWindow.print();
      reportWindow.close();
    };
  };

  return (
    <button
      onClick={handleExportPdf}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-sm backdrop-blur-md transition active:scale-90"
      aria-label="Εξαγωγή αναφοράς σε PDF"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  );
}
