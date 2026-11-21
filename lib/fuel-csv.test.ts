import { describe, expect, it } from "vitest";
import { buildFuelCsv } from "@/lib/fuel-csv";

describe("buildFuelCsv", () => {
  it("exports Greek Excel-compatible fuel rows safely", () => {
    const csv = buildFuelCsv([
      {
        id: "fuel-1",
        date: "2026-11-21",
        odometer: 12345,
        liters: 40.5,
        total_cost: 72.9,
        price_per_liter: 1.8,
        station: '=HYPERLINK("bad")',
        is_full_tank: true,
        notes: 'Ταξίδι "Αθήνα"',
        created_at: "2026-11-21T00:00:00.000Z",
        updated_at: "2026-11-21T00:00:00.000Z",
      },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"2026-11-21";"12345";"40.5"');
    expect(csv).toContain('\"\'=HYPERLINK(\"\"bad\"\")\"');
    expect(csv).toContain('"Ταξίδι ""Αθήνα"""');
  });
});
