import { describe, expect, it } from "vitest";
import {
  createFuelEntrySchema,
  validateOdometerMonotonicity,
} from "@/lib/validation";

describe("validateOdometerMonotonicity", () => {
  it("allows higher odometer readings", () => {
    expect(
      validateOdometerMonotonicity(
        [1000, 1200],
        1300,
        undefined,
        [
          { id: "a", odometer: 1000 },
          { id: "b", odometer: 1200 },
        ],
      ),
    ).toBeNull();
  });

  it("rejects lower odometer readings", () => {
    expect(
      validateOdometerMonotonicity(
        [1200],
        1100,
        undefined,
        [{ id: "a", odometer: 1200 }],
      ),
    ).toContain("cannot be lower");
  });

  it("excludes the edited entry id", () => {
    expect(
      validateOdometerMonotonicity(
        [1000, 1500],
        1200,
        "b",
        [
          { id: "a", odometer: 1000 },
          { id: "b", odometer: 1500 },
        ],
      ),
    ).toBeNull();
  });
});

describe("createFuelEntrySchema", () => {
  it("keeps a client-generated id for idempotent offline retries", () => {
    const id = "0f927d57-86f8-46fb-9097-48c212fd6458";
    const result = createFuelEntrySchema.parse({
      id,
      date: "2026-11-21",
      odometer: 1000,
      liters: 40,
      total_cost: 70,
      is_full_tank: true,
    });

    expect(result.id).toBe(id);
  });
});
