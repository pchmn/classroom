import { GRID_PADDING_RATIO } from "../grids";

export type Counts = { units: number; tenths: number; hundredths: number };
export type Point = { x: number; y: number };
export type BaseId = `base-${number}`;
export type OverlayId = `unit-${number}` | "tenths" | "hundredths";
// Overlays rest at "home", on a base (snapped), or anywhere in grid-size units.
export type Placement = "home" | BaseId | Point;

export const MAX: Counts = { units: 3, tenths: 9, hundredths: 9 };
export const LABEL_RATIO = 0.22;
const SNAP_DISTANCE = 0.25;

export const baseIds = (units: number): BaseId[] =>
  Array.from({ length: units + 1 }, (_, i) => `base-${i}` as const);

export const overlayIds = (units: number): OverlayId[] => [
  ...Array.from({ length: units }, (_, i) => `unit-${i}` as const),
  "tenths",
  "hundredths",
];

export const isBase = (p: Placement | undefined): p is BaseId =>
  typeof p === "string" && p.startsWith("base");

export function computeLayout(
  width: number,
  height: number,
  bases: BaseId[],
  overlays: OverlayId[],
) {
  // With several units, the base grids touch to form one board on its own row.
  const oneRow = bases.length === 1;
  const rows: string[][] = oneRow ? [[...bases, ...overlays]] : [bases, overlays];
  const cols = Math.max(...rows.map((r) => r.length));
  const size = Math.max(
    0,
    Math.min((width * 0.9) / cols, (height - 20) / (rows.length * (1 + LABEL_RATIO))),
  );
  const labelH = size * LABEL_RATIO;
  const gapY = (height - rows.length * (size + labelH)) / (rows.length + 1);
  const home: Record<string, Point> = {};
  rows.forEach((row, r) => {
    const touching = !oneRow && r === 0;
    const gapX = touching
      ? -size * GRID_PADDING_RATIO
      : (width - row.length * size) / (row.length + 1);
    const startX = touching ? (width - row.length * size - (row.length - 1) * gapX) / 2 : gapX;
    row.forEach((id, c) => {
      home[id] = {
        x: (startX + c * (size + gapX)) / size,
        y: (gapY + r * (size + labelH + gapY)) / size,
      };
    });
  });
  return { size, home };
}

export function resolve(
  placement: Placement | undefined,
  id: OverlayId,
  home: Record<string, Point>,
) {
  if (placement === undefined || placement === "home") return home[id];
  if (typeof placement === "string") return home[placement];
  return placement;
}

export function hundredthsOf(id: OverlayId, counts: Counts) {
  if (id.startsWith("unit")) return 100;
  return id === "tenths" ? counts.tenths * 10 : counts.hundredths;
}

export function coveredHundredths(at: Partial<Record<OverlayId, Placement>>, counts: Counts) {
  return overlayIds(counts.units)
    .filter((id) => isBase(at[id]))
    .reduce((sum, id) => sum + hundredthsOf(id, counts), 0);
}

export function nearestBase(p: Point, bases: BaseId[], home: Record<string, Point>) {
  return bases.find((b) => Math.hypot(p.x - home[b].x, p.y - home[b].y) < SNAP_DISTANCE);
}

// Each whole unit covers its own base; tenths and hundredths share the last one.
export function stackTargets(units: number): [OverlayId, BaseId][] {
  const bases = baseIds(units);
  return overlayIds(units).map((id) => [
    id,
    id.startsWith("unit") ? (`base-${id.split("-")[1]}` as BaseId) : bases.at(-1)!,
  ]);
}
