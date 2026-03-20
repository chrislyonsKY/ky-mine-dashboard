import { describe, it, expect } from "vitest";
import { getMineStatuLabel } from "../mine-statu-labels.js";

describe("getMineStatuLabel", () => {
  it("returns label for known code", () => {
    expect(getMineStatuLabel("A1")).toBe("Active — Currently Mined");
    expect(getMineStatuLabel("RC")).toBe("Released");
    expect(getMineStatuLabel("FF")).toBe("Final Forfeiture");
  });

  it("returns 'No Data' for null", () => {
    expect(getMineStatuLabel(null)).toBe("No Data");
  });

  it("returns 'No Data' for empty string", () => {
    expect(getMineStatuLabel("")).toBe("No Data");
  });

  it("returns 'No Data' for undefined", () => {
    expect(getMineStatuLabel(undefined)).toBe("No Data");
  });

  it("returns code itself for unknown code", () => {
    expect(getMineStatuLabel("ZZ")).toBe("ZZ");
  });
});
