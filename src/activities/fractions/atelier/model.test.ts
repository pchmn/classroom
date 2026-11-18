import { describe, expect, it } from "vite-plus/test";
import {
  barOffsets,
  BAR,
  example,
  glueRight,
  groups,
  positionOf,
  remove,
  resize,
  snap,
  STEP,
  summarize,
  type GridItem,
} from "./model";

const base = (id: number, x: number, y = 0.4, size = 10): GridItem => ({
  id,
  kind: "base",
  cols: size,
  rows: size,
  filled: [],
  at: { x, y },
});

const fill = (id: number, at: GridItem["at"], filled: number[], cols = 10, rows = 1): GridItem => ({
  id,
  kind: "fill",
  cols,
  rows,
  filled,
  color: "#000",
  at,
});

describe("groups", () => {
  it("joins bases placed exactly one step apart", () => {
    const items = [base(1, 0), base(2, STEP), base(3, 5)];
    expect(groups(items).map((g) => g.map((b) => b.id))).toEqual([[1, 2], [3]]);
  });
});

describe("summarize", () => {
  it("adds the fills on a group, over the shared denominator", () => {
    const items = [
      base(1, 0),
      fill(2, 1, [0, 1, 2, 3, 4, 5, 6]),
      fill(3, 1, [7, 17, 27, 37, 47], 10, 10),
    ];
    const { total, parts } = summarize(items, [items[0]]);
    expect(total).toEqual([75, 100]);
    expect(parts.map((p) => p.id)).toEqual([2, 3]);
  });

  it("counts a fully colored grid as a whole unit", () => {
    const items = [
      base(1, 0),
      base(2, STEP),
      fill(3, 1, [...Array(10).keys()]),
      fill(4, 2, [0, 1, 2]),
    ];
    const { total, whole, parts } = summarize(items, groups(items)[0]);
    expect(total).toEqual([130, 100]);
    expect(whole.map((w) => w.id)).toEqual([3]);
    expect(parts.map((p) => p.id)).toEqual([4]);
  });

  it("ignores empty and loose fills", () => {
    const items = [base(1, 0), fill(2, 1, []), fill(3, { x: 3, y: 3 }, [0])];
    expect(summarize(items, [items[0]]).total[0]).toBe(0);
  });
});

describe("snap", () => {
  it("drops a fill onto a nearby base", () => {
    const items = [base(1, 1, 1), fill(2, { x: 1.2, y: 1.1 }, [])];
    expect(snap(items, items[1])).toBe(1);
  });

  it("glues a base beside another", () => {
    const items = [base(1, 1, 1), base(2, 1 + STEP + 0.3, 1.2)];
    expect(snap(items, items[1])).toEqual({ x: 1 + STEP, y: 1 });
  });

  it("keeps a loose fill below the top edge so its bar stays visible", () => {
    const items = [fill(1, { x: -1, y: 0 }, [])];
    expect(snap(items, items[0])).toEqual({ x: 0, y: BAR });
  });
});

describe("resize", () => {
  it("keeps colored cells at their row and column", () => {
    const grid = fill(1, 0, [0, 11, 19], 10, 2);
    expect(resize(grid, 5, 2).filled).toEqual([0, 6]);
  });
});

describe("remove", () => {
  it("leaves the fills of a removed base where they were", () => {
    const items = [base(1, 2, 3), fill(2, 1, [])];
    expect(remove(items, 1)).toEqual([{ ...items[1], at: { x: 2, y: 3 } }]);
  });
});

describe("glueRight", () => {
  it("adds a base after the last one of the group", () => {
    const items = [base(1, 0), base(2, STEP)];
    const added = glueRight(items, items[0]).at(-1)!;
    expect(positionOf(items, added)).toEqual({ x: 2 * STEP, y: 0.4 });
  });
});

describe("barOffsets", () => {
  it("fans out fills stacked on the same base", () => {
    expect(
      barOffsets([base(1, 0), fill(2, 1, []), fill(3, 1, []), fill(4, { x: 0, y: 0 }, [])]),
    ).toEqual(
      new Map([
        [2, 0],
        [3, 1],
        [4, 0],
      ]),
    );
  });
});

describe("example", () => {
  it("starts with 7/10 and 5/100 next to an empty base", () => {
    expect(example().map((it) => it.filled.length)).toEqual([0, 7, 5]);
  });
});
