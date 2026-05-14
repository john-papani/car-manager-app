import type { FuelEntry } from "@/types/car";

export function calculateConsumption(
  currentEntry: FuelEntry,
  previousEntry?: FuelEntry
) {
  if (!previousEntry) return null;

  const kmDiff = currentEntry.odometer - previousEntry.odometer;

  if (kmDiff <= 0) return null;
  if (!currentEntry.is_full_tank) return null;

  const consumption = (currentEntry.liters / kmDiff) * 100;

  if (!Number.isFinite(consumption)) {
    return null;
  }

  return Number(consumption.toFixed(2));
}

export function calculateCostPerKm(
  currentEntry: FuelEntry,
  previousEntry?: FuelEntry
) {
  if (!previousEntry) return null;

  const kmDiff = currentEntry.odometer - previousEntry.odometer;

  if (kmDiff <= 0) return null;

  const costPerKm = currentEntry.total_cost / kmDiff;

  if (!Number.isFinite(costPerKm)) {
    return null;
  }

  return Number(costPerKm.toFixed(3));
}

export function calculateFuelStats(entries: FuelEntry[]) {
  const chronologicalEntries = [...entries].sort(
    (a, b) => a.odometer - b.odometer
  );
  const consumptions = chronologicalEntries
    .map((entry, index) =>
      index === 0
        ? null
        : calculateConsumption(entry, chronologicalEntries[index - 1])
    )
    .filter((value): value is number => value !== null);

  if (entries.length === 0) {
    return {
      totalCost: 0,
      totalLiters: 0,
      averagePricePerLiter: 0,
      averageConsumption: 0,
      consumptionSamples: 0,
      latestOdometer: 0,
    };
  }

  const totalCost = entries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const totalLiters = entries.reduce((sum, entry) => sum + entry.liters, 0);
  const averagePricePerLiter =
    totalLiters > 0 ? totalCost / totalLiters : 0;
  const averageConsumption =
    consumptions.length > 0
      ? consumptions.reduce((sum, value) => sum + value, 0) / consumptions.length
      : 0;

  return {
    totalCost: Number(totalCost.toFixed(2)),
    totalLiters: Number(totalLiters.toFixed(2)),
    averagePricePerLiter: Number(averagePricePerLiter.toFixed(3)),
    averageConsumption: Number(averageConsumption.toFixed(2)),
    consumptionSamples: consumptions.length,
    latestOdometer: Math.max(...entries.map((entry) => entry.odometer)),
  };
}

export function getRecentConsumptionTrend(
  entries: FuelEntry[],
  limit = 6
) {
  const chronologicalEntries = [...entries].sort(
    (a, b) => a.odometer - b.odometer
  );

  const points = chronologicalEntries
    .map((entry, index) => {
      if (index === 0) {
        return null;
      }

      const consumption = calculateConsumption(
        entry,
        chronologicalEntries[index - 1]
      );

      if (consumption === null) {
        return null;
      }

      return {
        id: entry.id,
        date: entry.date,
        odometer: entry.odometer,
        value: consumption,
      };
    })
    .filter(
      (
        point
      ): point is {
        id: string;
        date: string;
        odometer: number;
        value: number;
      } => point !== null
    );

  return points.slice(-limit);
}
