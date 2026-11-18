import { addFractions, expandTo, type Fraction } from "../../../lib/fraction";
import { GRID_PADDING_RATIO, PALETTE } from "../grids";

export type Point = { x: number; y: number };
export type GridKind = "base" | "fill";
export type GridItem = {
  id: number;
  kind: GridKind;
  cols: number;
  rows: number;
  filled: number[];
  color?: string;
  // A fill grid sitting on a base stores the base id and travels with it.
  at: Point | number;
};

// Positions and sizes are in grid units: one grid is 1 × 1.
export const STEP = 1 - GRID_PADDING_RATIO;
export const BAR = 0.17;
export const MIN_SIZE = 1;
export const MAX_SIZE = 20;
const SNAP = 0.3;
const GLUE_SNAP = 0.5;
const EPSILON = 1e-6;
const FALLBACK: Point = { x: 0.2, y: 0.4 };

export const rowY = (row: number) => 0.4 + row * 1.5;
export const cellCount = (it: GridItem) => it.cols * it.rows;
export const clampSize = (n: number) => Math.max(MIN_SIZE, Math.min(MAX_SIZE, n));

export function example(): GridItem[] {
  return [
    { id: 1, kind: "base", cols: 10, rows: 10, filled: [], at: { x: 0.25, y: rowY(0) } },
    {
      id: 2,
      kind: "fill",
      cols: 10,
      rows: 1,
      filled: [0, 1, 2, 3, 4, 5, 6],
      color: PALETTE[0],
      at: { x: 1.6, y: rowY(0) },
    },
    {
      id: 3,
      kind: "fill",
      cols: 10,
      rows: 10,
      filled: [7, 17, 27, 37, 47],
      color: PALETTE[1],
      at: { x: 2.95, y: rowY(0) },
    },
  ];
}

export const nextId = (items: GridItem[]) => Math.max(0, ...items.map((it) => it.id)) + 1;

export function positionOf(items: GridItem[], it: GridItem): Point {
  if (typeof it.at !== "number") return it.at;
  const base = items.find((o) => o.id === it.at);
  return base ? positionOf(items, base) : FALLBACK;
}

const samePoint = (a: Point, b: Point) =>
  Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;

// Base grids placed side by side, exactly one STEP apart, read as a single number line.
export function groups(items: GridItem[]): GridItem[][] {
  const bases = items.filter((it) => it.kind === "base");
  const parent = new Map(bases.map((b) => [b.id, b.id]));
  const find = (id: number): number => (parent.get(id) === id ? id : find(parent.get(id)!));
  for (const a of bases) {
    for (const b of bases) {
      const pa = positionOf(items, a);
      const pb = positionOf(items, b);
      if (samePoint({ x: pa.x + STEP, y: pa.y }, pb)) parent.set(find(b.id), find(a.id));
    }
  }
  const byRoot = new Map<number, GridItem[]>();
  for (const b of bases) {
    const root = find(b.id);
    byRoot.set(root, [...(byRoot.get(root) ?? []), b]);
  }
  return [...byRoot.values()].map((g) =>
    g.sort((a, b) => positionOf(items, a).x - positionOf(items, b).x),
  );
}

export type GroupSummary = {
  total: Fraction;
  // Whole grids read as units, then the rest from tenths to hundredths, as taught in class.
  whole: GridItem[];
  parts: GridItem[];
};

export function summarize(items: GridItem[], group: GridItem[]): GroupSummary {
  const ids = new Set(group.map((b) => b.id));
  const onTop = items.filter(
    (it) => it.kind === "fill" && typeof it.at === "number" && ids.has(it.at) && it.filled.length,
  );
  let total = onTop.reduce<Fraction>(
    (acc, it) => addFractions(acc, [it.filled.length, cellCount(it)]),
    [0, 1],
  );
  const denominators = new Set(group.map(cellCount));
  if (denominators.size === 1) total = expandTo(total, [...denominators][0]);
  const whole = onTop.filter((it) => it.filled.length === cellCount(it));
  const parts = onTop
    .filter((it) => !whole.includes(it))
    .sort((a, b) => cellCount(a) - cellCount(b));
  return { total, whole, parts };
}

// Where a dropped grid lands: a fill grid onto a nearby base, a base glued beside another.
export function snap(items: GridItem[], it: GridItem): GridItem["at"] {
  const p = positionOf(items, it);
  const bases = items.filter((o) => o.kind === "base");
  if (it.kind === "fill") {
    const target = bases.find(
      (b) => Math.hypot(p.x - positionOf(items, b).x, p.y - positionOf(items, b).y) < SNAP,
    );
    return target ? target.id : clampDrop(it.kind, p);
  }
  for (const b of bases) {
    if (b.id === it.id) continue;
    const q = positionOf(items, b);
    for (const side of [STEP, -STEP]) {
      const spot = { x: q.x + side, y: q.y };
      const free = !bases.some((o) => o.id !== it.id && samePoint(positionOf(items, o), spot));
      if (free && Math.hypot(p.x - spot.x, p.y - spot.y) < GLUE_SNAP)
        return clampDrop(it.kind, spot);
    }
  }
  return clampDrop(it.kind, p);
}

// Keeps a dropped grid inside the stage, its handle bar included.
const clampDrop = (kind: GridKind, p: Point): Point => ({
  x: Math.max(0, p.x),
  y: Math.max(kind === "fill" ? BAR : 0, p.y),
});

// Keeps colored cells at the same row/column when the grid is resized.
export function resize(it: GridItem, cols: number, rows: number): GridItem {
  const filled = it.filled
    .map((i) => [Math.floor(i / it.cols), i % it.cols])
    .filter(([r, c]) => r < rows && c < cols)
    .map(([r, c]) => r * cols + c);
  return { ...it, cols, rows, filled };
}

export function freeSpot(items: GridItem[], kind: GridKind, maxX: number): Point {
  for (let r = kind === "base" ? 0 : 1; r < 4; r++) {
    for (let x = 0.2; x <= Math.max(0.2, maxX); x += 1.3) {
      const y = rowY(r);
      const taken = items.some((it) => {
        const p = positionOf(items, it);
        return Math.abs(p.x - x) < 0.9 && Math.abs(p.y - y) < 0.9;
      });
      if (!taken) return { x, y };
    }
  }
  return { x: 0.3 + Math.random(), y: 0.4 + Math.random() };
}

// Fill grids resting on the removed base stay where they were.
export function remove(items: GridItem[], id: number): GridItem[] {
  const gone = items.find((it) => it.id === id);
  if (!gone) return items;
  const at = positionOf(items, gone);
  return items
    .filter((it) => it.id !== id)
    .map((it) => (it.at === id ? { ...it, at: { ...at } } : it));
}

export function glueRight(items: GridItem[], base: GridItem): GridItem[] {
  const group = groups(items).find((g) => g.some((b) => b.id === base.id)) ?? [base];
  const last = positionOf(items, group.at(-1)!);
  return [
    ...items,
    {
      id: nextId(items),
      kind: "base",
      cols: base.cols,
      rows: base.rows,
      filled: [],
      at: { x: last.x + STEP, y: last.y },
    },
  ];
}

// Fill grids stacked on the same base fan their bars upward so each stays grabbable.
export function barOffsets(items: GridItem[]): Map<number, number> {
  const perBase = new Map<number, number>();
  const offsets = new Map<number, number>();
  for (const it of items) {
    if (it.kind !== "fill") continue;
    if (typeof it.at !== "number") {
      offsets.set(it.id, 0);
      continue;
    }
    const i = perBase.get(it.at) ?? 0;
    perBase.set(it.at, i + 1);
    offsets.set(it.id, i);
  }
  return offsets;
}

export function extent(items: GridItem[]): Point {
  let x = 0;
  let y = 0;
  for (const it of items) {
    const p = positionOf(items, it);
    x = Math.max(x, p.x + 1.3);
    y = Math.max(y, p.y + 1.6);
  }
  return { x, y };
}
