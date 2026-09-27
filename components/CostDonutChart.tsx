type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type CostDonutChartProps = {
  segments: DonutSegment[];
  total: number;
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
  ].join(" ");
}

export default function CostDonutChart({
  segments,
  total,
}: CostDonutChartProps) {
  const filteredSegments = segments.filter((segment) => segment.value > 0);

  if (total <= 0 || filteredSegments.length === 0) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-[var(--line)] bg-white/45 p-4 text-sm leading-6 text-[var(--muted)]">
        Δεν υπάρχουν ακόμα αρκετά κόστη για γράφημα κατανομής.
      </div>
    );
  }

  const arcSegments = filteredSegments.reduce<
    Array<DonutSegment & { startAngle: number; endAngle: number }>
  >((items, segment) => {
    const startAngle = items[items.length - 1]?.endAngle ?? 0;
    const endAngle = startAngle + (segment.value / total) * 360;

    items.push({
      ...segment,
      startAngle,
      endAngle,
    });

    return items;
  }, []);

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-2xl bg-[linear-gradient(180deg,rgb(255_255_255_/_0.82),rgb(242_233_220_/_0.45))] p-4 min-[390px]:flex-row"
      role="img"
      aria-label="Γράφημα κατανομής κόστους"
    >
      <div className="relative h-32 w-32 shrink-0 min-[390px]:h-36 min-[390px]:w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="rgb(22 49 58 / 0.08)"
            strokeWidth="16"
          />
          {arcSegments.map((segment) =>
            segment.endAngle - segment.startAngle >= 359.99 ? (
              <circle
                key={segment.label}
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={segment.color}
                strokeWidth="16"
              />
            ) : (
              <path
                key={segment.label}
                d={describeArc(60, 60, 42, segment.startAngle, segment.endAngle)}
                fill="none"
                stroke={segment.color}
                strokeWidth="16"
                strokeLinecap="round"
              />
            ),
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Σύνολο
          </span>
          <span className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            {total.toFixed(0)}€
          </span>
        </div>
      </div>

      <div className="w-full flex-1 space-y-3">
        {filteredSegments.map((segment) => {
          const percentage = total > 0 ? (segment.value / total) * 100 : 0;

          return (
            <div key={segment.label} className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm">
                <span className="font-medium text-[var(--foreground)]">
                  {segment.label}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-[var(--muted)] min-[360px]:text-sm">
                  {segment.value.toFixed(2)}€ · {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>Κατανομή κόστους</caption>
        <thead>
          <tr>
            <th>Κατηγορία</th>
            <th>Ποσό</th>
          </tr>
        </thead>
        <tbody>
          {filteredSegments.map((segment) => (
            <tr key={segment.label}>
              <td>{segment.label}</td>
              <td>{segment.value.toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
