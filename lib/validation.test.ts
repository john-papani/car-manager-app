import { describe, expect, it } from "vitest";
import { validateOdometerMonotonicity } from "@/lib/validation";

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
