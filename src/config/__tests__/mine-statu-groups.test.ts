import { describe, it, expect } from "vitest";
import { MINE_STATU_GROUPS, STATU_TO_GROUP } from "../mine-statu-groups.js";

describe("MINE_STATU_GROUPS", () => {
  it("has 5 groups", () => {
    expect(MINE_STATU_GROUPS).toHaveLength(5);
  });

  it("covers all expected labels", () => {
    const labels = MINE_STATU_GROUPS.map((g) => g.label);
    expect(labels).toContain("Active");
    expect(labels).toContain("Temporarily Inactive");
    expect(labels).toContain("Forfeiture / Enforcement");
    expect(labels).toContain("Released");
    expect(labels).toContain("Unknown");
  });
});

describe("STATU_TO_GROUP", () => {
  it("maps A1 to Active", () => {
    expect(STATU_TO_GROUP["A1"]).toBe("Active");
  });

  it("maps RC to Released", () => {
    expect(STATU_TO_GROUP["RC"]).toBe("Released");
  });

  it("maps FF to Forfeiture / Enforcement", () => {
    expect(STATU_TO_GROUP["FF"]).toBe("Forfeiture / Enforcement");
  });

  it("maps empty string to Unknown", () => {
    expect(STATU_TO_GROUP[""]).toBe("Unknown");
  });

  it("maps SP to Temporarily Inactive", () => {
    expect(STATU_TO_GROUP["SP"]).toBe("Temporarily Inactive");
  });
});
