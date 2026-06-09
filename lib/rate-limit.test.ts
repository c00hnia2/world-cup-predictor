import { afterEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  clearRateLimitStoresForTests,
  RATE_LIMITS,
} from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    clearRateLimitStoresForTests();
  });

  it("pozwala na żądania poniżej limitu", () => {
    const config = { limit: 3, windowMs: 60_000 };

    expect(checkRateLimit("test", "1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("test", "1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("test", "1.2.3.4", config).allowed).toBe(true);
  });

  it("blokuje po przekroczeniu limitu w oknie", () => {
    const config = { limit: 2, windowMs: 60_000 };

    expect(checkRateLimit("test", "1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("test", "1.2.3.4", config).allowed).toBe(true);

    const blocked = checkRateLimit("test", "1.2.3.4", config);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("izoluje limity po IP i przestrzeni nazw", () => {
    const config = { limit: 1, windowMs: 60_000 };

    expect(checkRateLimit("login", "1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("login", "5.6.7.8", config).allowed).toBe(true);
    expect(checkRateLimit("register", "1.2.3.4", config).allowed).toBe(true);
    expect(checkRateLimit("login", "1.2.3.4", config).allowed).toBe(false);
  });

  it("ma sensowne domyślne limity auth", () => {
    expect(RATE_LIMITS.login.limit).toBeGreaterThan(0);
    expect(RATE_LIMITS.register.limit).toBeGreaterThan(0);
    expect(RATE_LIMITS.inviteCodeLookup.limit).toBeGreaterThan(0);
  });
});
