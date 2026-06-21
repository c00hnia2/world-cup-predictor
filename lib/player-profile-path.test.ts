import { describe, expect, it } from "vitest";
import {
  getPlayerProfilePath,
  isSameProfilePath,
  toStaticPlayerNameClassName,
} from "@/lib/player-profile-path";

describe("isSameProfilePath", () => {
  it("matches identical profile paths", () => {
    expect(isSameProfilePath("/profile/Adi", "/profile/Adi")).toBe(true);
  });

  it("matches encoded profile paths", () => {
    expect(
      isSameProfilePath("/profile/Jan%20Kowalski", "/profile/Jan Kowalski"),
    ).toBe(true);
  });

  it("treats /profile as the same page as the profile owner slug", () => {
    expect(
      isSameProfilePath("/profile", "/profile/c00hnia", {
        username: "c00hnia",
        displayName: "c00hnia",
      }),
    ).toBe(true);
  });

  it("does not treat /profile as another player's profile page", () => {
    expect(
      isSameProfilePath("/profile", "/profile/Adi", {
        username: "c00hnia",
        displayName: "c00hnia",
      }),
    ).toBe(false);
  });
});

describe("getPlayerProfilePath", () => {
  it("falls back to /profile when slug is missing", () => {
    expect(getPlayerProfilePath(null, "")).toBe("/profile");
  });
});

describe("toStaticPlayerNameClassName", () => {
  it("removes interactive hover and cursor classes", () => {
    expect(
      toStaticPlayerNameClassName(
        "font-medium text-zinc-900 hover:text-emerald-600 cursor-pointer dark:hover:text-emerald-400",
      ),
    ).toBe("font-medium text-zinc-900");
  });
});
