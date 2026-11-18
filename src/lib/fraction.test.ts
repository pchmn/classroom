import { describe, expect, it } from "vite-plus/test";
import { addFractions, expandTo, gcd } from "./fraction";

describe("gcd", () => {
  it("returns the greatest common divisor", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 10)).toBe(1);
  });
});

describe("addFractions", () => {
  it("adds and reduces", () => {
    expect(addFractions([7, 10], [5, 100])).toEqual([3, 4]);
  });

  it("keeps zero over one", () => {
    expect(addFractions([0, 1], [0, 10])).toEqual([0, 1]);
  });
});

describe("expandTo", () => {
  it("expands to the given denominator when it divides evenly", () => {
    expect(expandTo([3, 4], 100)).toEqual([75, 100]);
  });

  it("keeps the fraction when it does not", () => {
    expect(expandTo([1, 3], 100)).toEqual([1, 3]);
  });
});
