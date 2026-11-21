import type { FuelEntry } from "@/types/car";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildFuelReportHtml(entries: FuelEntry[]) {
  const total = entries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const rows = entries
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(entry.date)}</td>
          <td>${escapeHtml(entry.station || "Χωρίς πρατήριο")}</td>
          <td>${entry.liters.toFixed(2)} L</td>
          <td>${entry.odometer.toLocaleString("el-GR")} km</td>
          <td>${entry.total_cost.toFixed(2)}€</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
    <html lang="el">
      <head>
        <meta charset="utf-8" />
        <title>Ιστορικό γεμισμάτων</title>
        <style>
          body { margin: 0; padding: 32px; color: #12313b; font: 14px Arial, sans-serif; }
          h1 { margin: 0 0 6px; font-size: 26px; }
          p { margin: 0 0 24px; color: #607078; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px 8px; border-bottom: 1px solid #dce3e5; text-align: left; }
          th { font-size: 12px; color: #607078; }
          td:last-child, th:last-child { text-align: right; }
          .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: 700; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Ιστορικό γεμισμάτων</h1>
        <p>${entries.length} ${entries.length === 1 ? "γέμισμα" : "γεμίσματα"}</p>
        <table>
          <thead><tr><th>Ημερομηνία</th><th>Πρατήριο</th><th>Λίτρα</th><th>Χιλιόμετρα</th><th>Κόστος</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="total">Σύνολο: ${total.toFixed(2)}€</div>
      </body>
    </html>`;
}
