type DatedCostEntry = {
  date: string;
  total_cost: number;
};

type DatedFuelEntry = DatedCostEntry & {
  liters: number;
  odometer: number;
};

export type PeriodReport = {
  label: string;
  periodKey: string;
  fuelCost: number;
  fuelLiters: number;
  serviceCost: number;
  expenseCost: number;
  totalCost: number;
  kmDriven: number;
  costPerKm: number | null;
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleString("el-GR", { month: "long", year: "numeric" });
}

function yearKey(date: Date) {
  return String(date.getFullYear());
}

function yearLabel(date: Date) {
  return date.getFullYear().toString();
}

function isInMonth(dateStr: string, key: string) {
  return dateStr.startsWith(key);
}

function isInYear(dateStr: string, key: string) {
  return dateStr.startsWith(key);
}

export function getRecentMonthOptions(count = 12) {
  const options: Array<{ key: string; label: string }> = [];
  const cursor = new Date();

  for (let index = 0; index < count; index += 1) {
    const key = monthKey(cursor);
    options.push({ key, label: monthLabel(cursor) });
    cursor.setMonth(cursor.getMonth() - 1);
  }

  return options;
}

export function getRecentYearOptions(count = 3) {
  const options: Array<{ key: string; label: string }> = [];
  const cursor = new Date();

  for (let index = 0; index < count; index += 1) {
    options.push({ key: yearKey(cursor), label: yearLabel(cursor) });
    cursor.setFullYear(cursor.getFullYear() - 1);
  }

  return options;
}

export function calculatePeriodKmDriven(
  fuelEntries: DatedFuelEntry[],
  periodKey: string,
  mode: "month" | "year",
) {
  const chronological = [...fuelEntries].sort((left, right) => left.odometer - right.odometer);
  const inPeriod = chronological.filter((entry) =>
    mode === "month"
      ? isInMonth(entry.date, periodKey)
      : isInYear(entry.date, periodKey),
  );

  if (inPeriod.length === 0) {
    return 0;
  }

  const beforePeriod = chronological.filter((entry) =>
    mode === "month"
      ? entry.date < `${periodKey}-01`
      : entry.date < `${periodKey}-01-01`,
  );

  const startOdometer =
    beforePeriod.length > 0
      ? beforePeriod[beforePeriod.length - 1].odometer
      : inPeriod[0].odometer;
  const endOdometer = inPeriod[inPeriod.length - 1].odometer;

  return Math.max(0, endOdometer - startOdometer);
}

export function buildPeriodReport(
  periodKey: string,
  mode: "month" | "year",
  fuelEntries: DatedFuelEntry[],
  expenseEntries: DatedCostEntry[],
  serviceEntries: DatedCostEntry[],
): PeriodReport {
  const matches = (date: string) =>
    mode === "month" ? isInMonth(date, periodKey) : isInYear(date, periodKey);

  const monthlyFuel = fuelEntries.filter((entry) => matches(entry.date));
  const monthlyExpenses = expenseEntries.filter((entry) => matches(entry.date));
  const monthlyService = serviceEntries.filter((entry) => matches(entry.date));

  const fuelCost = monthlyFuel.reduce((sum, entry) => sum + entry.total_cost, 0);
  const fuelLiters = monthlyFuel.reduce((sum, entry) => sum + entry.liters, 0);
  const expenseCost = monthlyExpenses.reduce((sum, entry) => sum + entry.total_cost, 0);
  const serviceCost = monthlyService.reduce((sum, entry) => sum + entry.total_cost, 0);
  const totalCost = fuelCost + expenseCost + serviceCost;
  const kmDriven = calculatePeriodKmDriven(fuelEntries, periodKey, mode);
  const costPerKm = kmDriven > 0 ? Number((totalCost / kmDriven).toFixed(3)) : null;

  const label =
    mode === "month"
      ? monthLabel(new Date(`${periodKey}-01T12:00:00`))
      : periodKey;

  return {
    label,
    periodKey,
    fuelCost,
    fuelLiters,
    serviceCost,
    expenseCost,
    totalCost,
    kmDriven,
    costPerKm,
  };
}

export function comparePeriodReports(current: PeriodReport, previous: PeriodReport) {
  const delta = current.totalCost - previous.totalCost;
  const percent =
    previous.totalCost > 0
      ? Number(((delta / previous.totalCost) * 100).toFixed(1))
      : null;

  return {
    previousLabel: previous.label,
    delta,
    percent,
  };
}
