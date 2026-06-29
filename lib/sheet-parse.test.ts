import { describe, expect, it } from "vitest";
import { parseSheetNumber, parseSheetNumberOrZero } from "@/lib/sheet-parse";
import { isFuelEntryValid, mapRowToFuelEntry } from "@/lib/fuel-entry";

describe("sheet-parse", () => {
  it("parses comma decimals", () => {
    expect(parseSheetNumber("1,75")).toBe(1.75);
  });

  it("returns null for invalid numbers", () => {
    expect(parseSheetNumber("abc")).toBeNull();
  });

  it("returns zero fallback", () => {
    expect(parseSheetNumberOrZero("")).toBe(0);
  });
});

describe("fuel-entry mapping", () => {
  it("maps valid fuel rows", () => {
    const entry = mapRowToFuelEntry({
      id: "fuel-1",
      date: "2026-01-01",
      odometer: "1000",
      liters: "40",
      total_cost: "70",
      price_per_liter: "1.75",
      is_full_tank: "TRUE",
      notes: "",
      receipt_file_id: "",
      receipt_url: "",
      calendar_event_id: "evt-1",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    expect(isFuelEntryValid(entry)).toBe(true);
    expect(entry.calendar_event_id).toBe("evt-1");
  });

  it("rejects invalid fuel rows", () => {
    const entry = mapRowToFuelEntry({
      id: "fuel-1",
      date: "2026-01-01",
      odometer: "0",
      liters: "40",
      total_cost: "70",
      price_per_liter: "1.75",
      is_full_tank: "TRUE",
      notes: "",
      receipt_file_id: "",
      receipt_url: "",
      calendar_event_id: "",
      created_at: "",
      updated_at: "",
    });

    expect(isFuelEntryValid(entry)).toBe(false);
  });
});
