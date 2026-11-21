import { describe, expect, it } from "vitest";
import { getDocumentStatus, sortDocumentsByUrgency } from "@/lib/document-status";
import type { VehicleDocument } from "@/types/car";

const today = new Date("2026-11-21T12:00:00Z");

describe("getDocumentStatus", () => {
  it("marks past dates as expired", () => {
    expect(getDocumentStatus("2026-11-20", today).status).toBe("expired");
  });

  it("marks the next 30 days as expiring", () => {
    expect(getDocumentStatus("2026-12-21", today)).toEqual({
      status: "expiring",
      daysRemaining: 30,
    });
  });

  it("marks later dates as active", () => {
    expect(getDocumentStatus("2026-12-22", today).status).toBe("active");
  });
});

describe("sortDocumentsByUrgency", () => {
  it("puts the nearest expiry first", () => {
    const base = {
      document_type: "insurance" as const,
      provider: "",
      notes: "",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    const documents: VehicleDocument[] = [
      { ...base, id: "later", expires_at: "2027-05-01" },
      { ...base, id: "nearer", expires_at: "2026-12-01" },
    ];

    expect(sortDocumentsByUrgency(documents).map((item) => item.id)).toEqual([
      "nearer",
      "later",
    ]);
  });
});
