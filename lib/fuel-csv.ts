import type { FuelEntry } from "@/types/car";

const HEADERS = [
  "Ημερομηνία",
  "Χιλιόμετρα",
  "Λίτρα",
  "Συνολικό κόστος",
  "Τιμή ανά λίτρο",
  "Πρατήριο",
  "Πλήρες ρεζερβουάρ",
  "Σημειώσεις",
];

function csvCell(value: string | number) {
  let text = String(value);

  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

export function buildFuelCsv(entries: FuelEntry[]) {
  const rows = entries.map((entry) => [
    entry.date,
    entry.odometer,
    entry.liters,
    entry.total_cost,
    entry.price_per_liter,
    entry.station ?? "",
    entry.is_full_tank ? "Ναι" : "Όχι",
    entry.notes ?? "",
  ]);

  return `\uFEFF${[HEADERS, ...rows]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n")}`;
}
