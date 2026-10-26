import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdminClient: () => ({ from: query.from }),
}));

import { GET } from "@/app/api/cron/keep-alive/route";

describe("GET /api/cron/keep-alive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_SECRET", "test-secret");
    query.from.mockReturnValue(query);
    query.select.mockReturnValue(query);
    query.limit.mockResolvedValue({ error: null });
  });

  afterEach(() => vi.unstubAllEnvs());

  it("rejects requests without the cron secret before reading the database", async () => {
    const response = await GET(new Request("http://localhost/api/cron/keep-alive"));
    expect(response.status).toBe(401);
    expect(query.from).not.toHaveBeenCalled();
  });

  it("fails closed when CRON_SECRET is missing", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const response = await GET(new Request("http://localhost/api/cron/keep-alive"));
    expect(response.status).toBe(503);
    expect(query.from).not.toHaveBeenCalled();
  });

  it("performs a small database read for an authorized request", async () => {
    const response = await GET(new Request("http://localhost/api/cron/keep-alive", {
      headers: { authorization: "Bearer test-secret" },
    }));
    expect(response.status).toBe(200);
    expect(query.from).toHaveBeenCalledWith("vehicle_profiles");
    expect(query.select).toHaveBeenCalledWith("id");
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("reports an upstream database failure", async () => {
    query.limit.mockResolvedValue({ error: { message: "database unavailable" } });
    const response = await GET(new Request("http://localhost/api/cron/keep-alive", {
      headers: { authorization: "Bearer test-secret" },
    }));
    expect(response.status).toBe(502);
  });
});
