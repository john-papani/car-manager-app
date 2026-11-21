import { describe, expect, it } from "vitest";
import { buildFuelReportHtml } from "@/lib/fuel-report-html";
import type { FuelEntry } from "@/types/car";

describe("buildFuelReportHtml", () => {
  it("renders totals and escapes station names", () => {
    const entry = {
      id: "1",
      date: "2026-11-21",
      station: "A&B <Fuel>",
      liters: 20,
      price_per_liter: 1.8,
      total_cost: 36,
      odometer: 12000,
    } as FuelEntry;

    const html = buildFuelReportHtml([entry]);

    expect(html).toContain("A&amp;B &lt;Fuel&gt;");
    expect(html).toContain("Σύνολο: 36.00€");
  });
});
