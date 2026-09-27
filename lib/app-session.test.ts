import { afterEach, expect, it, vi } from "vitest";
import { auth } from "@/auth";
import { getAppSession } from "./app-session";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

it("allows local access only with an explicit development flag", async () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("AUTH_BYPASS", "true");
  expect((await getAppSession())?.user?.id).toBe("local-dev");
  expect(auth).not.toHaveBeenCalled();
});

it.each([
  ["production", "true"],
  ["test", "true"],
  ["development", "false"],
  ["development", undefined],
])("requires real auth in %s with flag %s", async (environment, flag) => {
  vi.stubEnv("NODE_ENV", environment);
  vi.stubEnv("AUTH_BYPASS", flag);
  vi.mocked(auth).mockResolvedValue(null as never);
  expect(await getAppSession()).toBeNull();
  expect(auth).toHaveBeenCalledOnce();
});
