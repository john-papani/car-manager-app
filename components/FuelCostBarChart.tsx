import type { FuelEntry } from "@/types/car";

type FuelCostBarChartProps = {
  entries: FuelEntry[];
};

const shortDateFormatter = new Intl.DateTimeFormat("el-GR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

export default function FuelCostBarChart({ entries }: FuelCostBarChartProps) {
  const points = [...entries]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-6);

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/45 p-4 text-sm leading-6 text-[var(--muted)]">
        Δεν υπάρχουν ακόμα γεμίσματα για το γράφημα.
      </div>
    );
  }

  const maxCost = Math.max(...points.map((entry) => entry.total_cost), 1);

  return (
    <div
      className="rounded-2xl bg-[linear-gradient(180deg,rgb(255_255_255_/_0.82),rgb(253_242_233_/_0.58))] p-3 min-[360px]:p-4"
      role="img"
      aria-label="Κόστος των τελευταίων γεμισμάτων"
    >
      <div className="flex h-44 items-end gap-1.5 min-[360px]:gap-2.5">
        {points.map((entry, index) => {
          const height = Math.max((entry.total_cost / maxCost) * 100, 12);

          return (
            <div key={entry.id} className="flex min-w-0 flex-1 flex-col items-center">
              <span className="mb-2 text-[10px] font-bold tabular-nums text-[var(--foreground)] min-[360px]:text-xs">
                {entry.total_cost.toFixed(0)}€
              </span>
              <div className="flex h-28 w-full items-end justify-center">
                <div
                  className={`w-full max-w-10 rounded-t-xl shadow-[0_10px_20px_rgb(202_111_61_/_0.18)] ${
                    index === points.length - 1
                      ? "bg-[linear-gradient(180deg,#e8915f_0%,#ad5425_100%)]"
                      : "bg-[linear-gradient(180deg,#e8c0a7_0%,#ca6f3d_100%)]"
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="mt-2 text-[9px] font-medium tabular-nums text-[var(--muted)] min-[360px]:text-[10px]">
                {shortDateFormatter.format(new Date(`${entry.date}T00:00:00Z`))}
              </span>
            </div>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>Κόστος τελευταίων γεμισμάτων</caption>
        <thead>
          <tr>
            <th>Ημερομηνία</th>
            <th>Κόστος</th>
          </tr>
        </thead>
        <tbody>
          {points.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.date}</td>
              <td>{entry.total_cost.toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
