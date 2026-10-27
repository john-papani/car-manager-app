const DAY_IN_MS = 86_400_000;

export type CalendarDay = {
  date: string;
  day: number;
  inMonth: boolean;
};

export function monthKey(date: string) {
  return date.slice(0, 7);
}

export function moveMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function buildCalendarDays(month: string): CalendarDay[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1));
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;
  const gridStart = firstDay.getTime() - mondayOffset * DAY_IN_MS;

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart + index * DAY_IN_MS);
    const isoDate = date.toISOString().slice(0, 10);

    return {
      date: isoDate,
      day: date.getUTCDate(),
      inMonth: monthKey(isoDate) === month,
    };
  });
}
