import { describe, expect, it } from "vitest";
import {
  filterExpenseEntries,
  filterFuelEntries,
  filterServiceEntries,
  uniqueSortedValues,
} from "@/lib/entry-filters";
import {
  buildPeriodReport,
  comparePeriodReports,
} from "@/lib/report-calculations";
import {
  getCurrentOdometer,
  getServiceReminder,
} from "@/lib/service-reminders";

describe("entry-filters", () => {
  it("filters fuel entries by station and date", () => {
    const entries = [
      {
        date: "2026-03-01",
        odometer: 1000,
        station: "Shell",
        notes: "",
        total_cost: 50,
        liters: 30,
      },
      {
        date: "2026-02-01",
        odometer: 900,
        station: "EKO",
        notes: "",
        total_cost: 45,
        liters: 28,
      },
    ];

    const filtered = filterFuelEntries(entries, {
      query: "",
      dateRange: { from: "2026-03-01" },
      odometerRange: {},
      station: "shell",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].station).toBe("Shell");
  });

  it("filters service and expense entries by query", () => {
    const serviceEntries = [
      {
        date: "2026-01-10",
        odometer: 12000,
        service_type: "Oil change",
        location: "Garage",
        notes: "",
        total_cost: 80,
      },
    ];
    const expenseEntries = [
      {
        date: "2026-01-05",
        category: "Parking",
        vendor: "Center",
        notes: "",
        total_cost: 10,
        odometer: 11900,
      },
    ];

    expect(
      filterServiceEntries(serviceEntries, {
        query: "oil",
        dateRange: {},
        odometerRange: {},
      }),
    ).toHaveLength(1);
    expect(
      filterExpenseEntries(expenseEntries, {
        query: "center",
        dateRange: {},
        odometerRange: {},
      }),
    ).toHaveLength(1);
  });

  it("returns unique sorted values", () => {
    expect(uniqueSortedValues(["B", "A", "A", undefined, ""])).toEqual([
      "A",
      "B",
    ]);
  });
});

describe("service-reminders", () => {
  it("returns overdue reminder when odometer passed target", () => {
    const reminder = getServiceReminder(
      [
        {
          id: "1",
          date: "2026-01-01",
          odometer: 10000,
          total_cost: 100,
          service_type: "Oil",
          next_service_odometer: 15000,
          created_at: "",
          updated_at: "",
        },
      ],
      15100,
    );

    expect(reminder?.urgency).toBe("overdue");
    expect(reminder?.kmRemaining).toBe(-100);
  });

  it("uses max odometer from fuel and service entries", () => {
    expect(
      getCurrentOdometer(
        [{ odometer: 12000 } as never],
        [{ odometer: 13000 } as never],
      ),
    ).toBe(13000);
  });
});

describe("report-calculations", () => {
  it("builds monthly report with cost per km", () => {
    const report = buildPeriodReport(
      "2026-03",
      "month",
      [
        { date: "2026-02-20", total_cost: 40, liters: 20, odometer: 1000 },
        { date: "2026-03-10", total_cost: 50, liters: 25, odometer: 1200 },
      ],
      [{ date: "2026-03-05", total_cost: 20 }],
      [{ date: "2026-03-01", total_cost: 100 }],
    );

    expect(report.totalCost).toBe(170);
    expect(report.kmDriven).toBe(200);
    expect(report.costPerKm).toBe(0.85);
  });

  it("compares current and previous period totals", () => {
    const current = buildPeriodReport(
      "2026-03",
      "month",
      [{ date: "2026-03-10", total_cost: 100, liters: 20, odometer: 1000 }],
      [],
      [],
    );
    const previous = buildPeriodReport(
      "2026-02",
      "month",
      [{ date: "2026-02-10", total_cost: 50, liters: 10, odometer: 900 }],
      [],
      [],
    );

    expect(comparePeriodReports(current, previous)).toEqual({
      previousLabel: previous.label,
      delta: 50,
      percent: 100,
    });
  });
});
