import type { FuelEntry } from "@/types/car";

export function calculateFuelStats(entries: FuelEntry[]) {
  if (entries.length === 0) {
    return {
      totalCost: 0,
      totalLiters: 0,
      averagePricePerLiter: 0,
      latestOdometer: 0,
    };
  }

  const totalCost = entries.reduce((sum, entry) => sum + entry.total_cost, 0);
  const totalLiters = entries.reduce((sum, entry) => sum + entry.liters, 0);
  const averagePricePerLiter =
    totalLiters > 0 ? totalCost / totalLiters : 0;

  return {
    totalCost: Number(totalCost.toFixed(2)),
    totalLiters: Number(totalLiters.toFixed(2)),
    averagePricePerLiter: Number(averagePricePerLiter.toFixed(3)),
    latestOdometer: Math.max(...entries.map((entry) => entry.odometer)),
  };
}
