import { describe, expect, it } from "vitest";
import { calculateFuelStats } from "@/lib/fuel-calculations";
import type { FuelEntry } from "@/types/car";

const baseEntry = (
  overrides: Partial<FuelEntry> & Pick<FuelEntry, "id" | "odometer" | "liters">,
): FuelEntry => ({
  date: "2026-01-15",
  total_cost: 70,
  price_per_liter: 1.75,
  is_full_tank: true,
  created_at: "2026-01-15T10:00:00.000Z",
  updated_at: "2026-01-15T10:00:00.000Z",
  ...overrides,
});

describe("calculateFuelStats", () => {
  it("returns zero values for an empty history", () => {
    expect(calculateFuelStats([])).toEqual({
      totalCost: 0,
      totalLiters: 0,
      averagePricePerLiter: 0,
      latestOdometer: 0,
    });
  });

  it("includes every entry regardless of full-tank status", () => {
    const entries = [
      baseEntry({ id: "a", odometer: 1000, liters: 40, total_cost: 70 }),
      baseEntry({
        id: "b",
        odometer: 1200,
        liters: 30,
        total_cost: 60,
        is_full_tank: false,
      }),
    ];

    expect(calculateFuelStats(entries)).toEqual({
      totalCost: 130,
      totalLiters: 70,
      averagePricePerLiter: 1.857,
      latestOdometer: 1200,
    });
  });
});
