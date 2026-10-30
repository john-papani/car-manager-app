import { describe, expect, it } from "vitest";
import {
  calculateConsumption,
  calculateCostPerKm,
  calculateFuelStats,
  updateFuelAmounts,
} from "@/lib/fuel-calculations";
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

describe("fuel-calculations", () => {
  it("calculates liters from total cost and the suggested price", () => {
    const result = updateFuelAmounts(
      { liters: "", total_cost: "", price_per_liter: "1.800" },
      "total_cost",
      "72",
      null,
    );

    expect(result.values.liters).toBe("40.00");
    expect(result.autoField).toBe("liters");
  });

  it("keeps recalculating the automatically filled field", () => {
    const result = updateFuelAmounts(
      { liters: "40", total_cost: "72.00", price_per_liter: "1.800" },
      "liters",
      "42",
      "total_cost",
    );

    expect(result.values.total_cost).toBe("75.60");
    expect(result.autoField).toBe("total_cost");
  });

  it("recalculates price when an automatic amount is edited manually", () => {
    const result = updateFuelAmounts(
      { liters: "40.00", total_cost: "72.00", price_per_liter: "1.800" },
      "liters",
      "45",
      "liters",
    );

    expect(result.values.price_per_liter).toBe("1.600");
    expect(result.autoField).toBe("price_per_liter");
  });

  it("returns null consumption when previous entry is missing", () => {
    const current = baseEntry({ id: "a", odometer: 1000, liters: 40 });

    expect(calculateConsumption(current)).toBeNull();
  });

  it("returns null consumption when tank is not full", () => {
    const previous = baseEntry({ id: "a", odometer: 1000, liters: 40 });
    const current = baseEntry({
      id: "b",
      odometer: 1200,
      liters: 30,
      is_full_tank: false,
    });

    expect(calculateConsumption(current, previous)).toBeNull();
  });

  it("calculates consumption for full tank intervals", () => {
    const previous = baseEntry({ id: "a", odometer: 1000, liters: 40 });
    const current = baseEntry({ id: "b", odometer: 1200, liters: 30 });

    expect(calculateConsumption(current, previous)).toBe(15);
  });

  it("calculates cost per km", () => {
    const previous = baseEntry({ id: "a", odometer: 1000, liters: 40, total_cost: 70 });
    const current = baseEntry({ id: "b", odometer: 1100, liters: 35, total_cost: 63 });

    expect(calculateCostPerKm(current, previous)).toBe(0.63);
  });

  it("summarizes fuel stats", () => {
    const entries = [
      baseEntry({ id: "a", odometer: 1000, liters: 40, total_cost: 70 }),
      baseEntry({ id: "b", odometer: 1200, liters: 30, total_cost: 60 }),
    ];

    const stats = calculateFuelStats(entries);

    expect(stats.totalCost).toBe(130);
    expect(stats.totalLiters).toBe(70);
    expect(stats.consumptionSamples).toBe(1);
  });
});
