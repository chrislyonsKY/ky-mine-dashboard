import { describe, it, expect } from "vitest";
import { buildDefinitionExpression } from "../query-builder.js";

describe("buildDefinitionExpression", () => {
  it("returns base TRNS exclusion when no filters", () => {
    const result = buildDefinitionExpression({
      typeFlag: null,
      featCLS: null,
      mineStatuGroup: null,
    });
    expect(result).toBe("Type_Flag <> 'TRNS'");
  });

  it("adds Type_Flag filter", () => {
    const result = buildDefinitionExpression({
      typeFlag: "ACT",
      featCLS: null,
      mineStatuGroup: null,
    });
    expect(result).toBe("Type_Flag <> 'TRNS' AND Type_Flag = 'ACT'");
  });

  it("adds FeatCLS filter", () => {
    const result = buildDefinitionExpression({
      typeFlag: null,
      featCLS: "SF",
      mineStatuGroup: null,
    });
    expect(result).toBe("Type_Flag <> 'TRNS' AND FeatCLS = 'SF'");
  });

  it("combines multiple filters", () => {
    const result = buildDefinitionExpression({
      typeFlag: "INACT",
      featCLS: "UG",
      mineStatuGroup: null,
    });
    expect(result).toBe(
      "Type_Flag <> 'TRNS' AND Type_Flag = 'INACT' AND FeatCLS = 'UG'",
    );
  });

  it("adds MINE_STATU group filter for Released", () => {
    const result = buildDefinitionExpression({
      typeFlag: null,
      featCLS: null,
      mineStatuGroup: "Released",
    });
    expect(result).toContain("MINE_STATU IN");
    expect(result).toContain("'RC'");
    expect(result).toContain("'P1'");
  });

  it("handles Unknown group with null MINE_STATU", () => {
    const result = buildDefinitionExpression({
      typeFlag: null,
      featCLS: null,
      mineStatuGroup: "Unknown",
    });
    expect(result).toContain("MINE_STATU IS NULL");
  });

  it("always starts with TRNS exclusion", () => {
    const result = buildDefinitionExpression({
      typeFlag: "ACT",
      featCLS: "SF",
      mineStatuGroup: "Active",
    });
    expect(result.startsWith("Type_Flag <> 'TRNS'")).toBe(true);
  });
});
