import { describe, it, expect } from "vitest";
import { ROLES, toRole } from "./Role";

describe("toRole", () => {
  it("распознаёт известные роли", () => {
    expect(toRole(ROLES.master)).toBe("master");
    expect(toRole(ROLES.player)).toBe("player");
  });

  it("всё остальное превращает в null", () => {
    expect(toRole("admin")).toBeNull();
    expect(toRole("")).toBeNull();
    expect(toRole(undefined)).toBeNull();
    expect(toRole(null)).toBeNull();
    expect(toRole(42)).toBeNull();
    expect(toRole({ role: "master" })).toBeNull();
  });
});
