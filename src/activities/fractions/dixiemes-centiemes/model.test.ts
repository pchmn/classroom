import { describe, expect, it } from "vite-plus/test";
import { GRID_PADDING_RATIO } from "../grids";
import {
  baseIds,
  computeLayout,
  coveredHundredths,
  nearestBase,
  overlayIds,
  stackTargets,
} from "./model";

describe("computeLayout", () => {
  it("puts every grid on one row when there is a single base", () => {
    const { home } = computeLayout(1000, 600, baseIds(0), overlayIds(0));
    expect(new Set(Object.values(home).map((p) => p.y)).size).toBe(1);
  });

  it("makes base grids touch, overlapping their padding", () => {
    const { home } = computeLayout(1000, 600, baseIds(2), overlayIds(2));
    expect(home["base-1"].x - home["base-0"].x).toBeCloseTo(1 - GRID_PADDING_RATIO);
    expect(home["base-0"].y).toBeLessThan(home.tenths.y);
  });
});

describe("coveredHundredths", () => {
  const counts = { units: 1, tenths: 7, hundredths: 5 };

  it("sums the overlays snapped on a base", () => {
    expect(
      coveredHundredths({ "unit-0": "base-0", tenths: "base-1", hundredths: "home" }, counts),
    ).toBe(170);
  });

  it("ignores overlays dropped elsewhere", () => {
    expect(coveredHundredths({ tenths: { x: 1, y: 1 } }, counts)).toBe(0);
  });
});

describe("nearestBase", () => {
  const home = { "base-0": { x: 1, y: 1 } };

  it("snaps within a quarter grid", () => {
    expect(nearestBase({ x: 1.2, y: 1.1 }, ["base-0"], home)).toBe("base-0");
  });

  it("does not snap farther away", () => {
    expect(nearestBase({ x: 1.3, y: 1 }, ["base-0"], home)).toBeUndefined();
  });
});

describe("stackTargets", () => {
  it("covers each base with a unit and the last one with tenths and hundredths", () => {
    expect(stackTargets(2)).toEqual([
      ["unit-0", "base-0"],
      ["unit-1", "base-1"],
      ["tenths", "base-2"],
      ["hundredths", "base-2"],
    ]);
  });
});
