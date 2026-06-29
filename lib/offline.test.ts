import { describe, expect, it } from "vitest";
import { getOfflineSuccessMessage } from "@/lib/offline-create";
import {
  isBrowserOffline,
  shouldQueueOfflineRequest,
} from "@/lib/offline-network";

describe("offline-network", () => {
  it("detects fetch failures as queueable network errors", () => {
    expect(shouldQueueOfflineRequest(new TypeError("Failed to fetch"))).toBe(true);
    expect(shouldQueueOfflineRequest(new Error("NetworkError when attempting to fetch resource."))).toBe(true);
    expect(shouldQueueOfflineRequest(new Error("Validation failed"))).toBe(false);
  });

  it("returns offline messaging for queued saves", () => {
    expect(getOfflineSuccessMessage(true, "Saved")).toContain("offline");
    expect(getOfflineSuccessMessage(false, "Saved")).toBe("Saved");
  });

  it("reads browser offline state safely", () => {
    expect(typeof isBrowserOffline()).toBe("boolean");
  });
});
