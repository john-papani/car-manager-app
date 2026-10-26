import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  not: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  neq: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdminClient: () => ({ from: query.from }),
}));

import { getHighestOdometer } from "@/lib/supabase-data";

describe("getHighestOdometer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const method of ["from", "select", "eq", "not", "order", "limit", "neq"] as const) {
      query[method].mockReturnValue(query);
    }
  });

  it("reads only the highest odometer for the current owner and excludes the edited row", async () => {
    query.maybeSingle.mockResolvedValue({ data: { odometer: 12345 }, error: null });

    expect(await getHighestOdometer("fuel_entries", "user-id", "edited-id")).toBe(12345);
    expect(query.from).toHaveBeenCalledWith("fuel_entries");
    expect(query.select).toHaveBeenCalledWith("odometer");
    expect(query.eq).toHaveBeenCalledWith("owner_id", "user-id");
    expect(query.neq).toHaveBeenCalledWith("id", "edited-id");
    expect(query.order).toHaveBeenCalledWith("odometer", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("treats a user with no previous reading as zero", async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });

    expect(await getHighestOdometer("service_entries", "user-id")).toBe(0);
    expect(query.neq).not.toHaveBeenCalled();
  });
});
