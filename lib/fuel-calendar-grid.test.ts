import { describe, expect, it } from "vitest";
import { buildCalendarDays, moveMonth } from "@/lib/fuel-calendar-grid";

describe("fuel calendar grid", () => {
  it("starts on Monday and always renders six weeks", () => {
    const days = buildCalendarDays("2026-10");

    expect(days).toHaveLength(42);
    expect(days[0]).toEqual({ date: "2026-09-28", day: 28, inMonth: false });
    expect(days[41]).toEqual({ date: "2026-11-08", day: 8, inMonth: false });
  });

  it("moves across year boundaries", () => {
    expect(moveMonth("2026-01", -1)).toBe("2025-12");
    expect(moveMonth("2026-12", 1)).toBe("2027-01");
  });
});
