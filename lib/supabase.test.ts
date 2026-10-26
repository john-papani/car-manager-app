import { describe, expect, it } from "vitest";
import type { AppSession } from "@/auth";
import { getSessionOwnerId } from "@/lib/supabase";

describe("getSessionOwnerId", () => {
  it("uses the stable Supabase user id instead of the email", () => {
    const session = {
      user: {
        id: "1a7d0cf2-1d06-4a12-8b34-cb04bd687a52",
        email: "driver@example.com",
        name: null,
        image: null,
      },
    } satisfies AppSession;

    expect(getSessionOwnerId(session)).toBe(
      "1a7d0cf2-1d06-4a12-8b34-cb04bd687a52",
    );
  });
});
