type ConsumptionPoint = {
  id: string;
  date: string;
  odometer: number;
  value: number;
};

type ConsumptionBarChartProps = {
  points: ConsumptionPoint[];
};

export default function ConsumptionBarChart({
  points,
}: ConsumptionBarChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-[var(--line)] bg-white/45 p-4 text-sm leading-6 text-[var(--muted)]">
        Χρειάζονται τουλάχιστον δύο γεμίσματα με full tank για να βγει
        γράφημα κατανάλωσης.
      </div>
    );
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="rounded-[1.6rem] bg-white/50 p-4">
      <div className="flex h-40 items-end gap-3">
        {points.map((point) => {
          const height = Math.max((point.value / maxValue) * 100, 16);

          return (
            <div key={point.id} className="flex flex-1 flex-col items-center">
              <span className="mb-2 text-xs font-semibold text-[var(--foreground)]">
                {point.value.toFixed(1)}
              </span>
              <div className="flex h-28 w-full items-end justify-center">
                <div
                  className="w-full rounded-t-[1rem] bg-[linear-gradient(180deg,#ca6f3d_0%,#ad5425_100%)] shadow-[0_12px_20px_rgb(202_111_61_/_0.2)]"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="mt-3 text-[11px] font-medium text-[var(--muted)]">
                {new Date(point.date).toLocaleDateString("el-GR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
