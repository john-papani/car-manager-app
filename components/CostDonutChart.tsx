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
    <div className="flex items-center gap-4 rounded-[1.6rem] bg-white/50 p-4">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="rgb(22 49 58 / 0.08)"
            strokeWidth="16"
          />
          {arcSegments.map((segment) => (
            <path
              key={segment.label}
              d={describeArc(60, 60, 42, segment.startAngle, segment.endAngle)}
              fill="none"
              stroke={segment.color}
              strokeWidth="16"
              strokeLinecap="round"
            />
          ))}
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

      <div className="flex-1 space-y-3">
        {filteredSegments.map((segment) => {
          const percentage = total > 0 ? (segment.value / total) * 100 : 0;

          return (
            <div key={segment.label} className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex flex-1 items-center justify-between gap-3 text-sm">
                <span className="font-medium text-[var(--foreground)]">
                  {segment.label}
                </span>
                <span className="text-[var(--muted)]">
                  {segment.value.toFixed(2)}€ · {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
