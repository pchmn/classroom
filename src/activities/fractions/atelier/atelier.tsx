import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { startDrag } from "../../../lib/drag";
import { useElementSize } from "../../../lib/use-element-size";
import { useLocalStorage } from "../../../lib/use-local-storage";
import { useRaise } from "../../../lib/use-raise";
import { useTransientSet } from "../../../lib/use-transient-set";
import { Button, Fraction, NumberField, Swatches, Toolbar, ToolbarSeparator } from "../../../ui";
import { ActivityLayout } from "../../activity-layout";
import { COLORS, PALETTE } from "../grids";
import { GridMenu } from "./grid-menu";
import { GridView } from "./grid-view";
import {
  BAR,
  barOffsets,
  cellCount,
  example,
  extent,
  freeSpot,
  glueRight,
  groups,
  MAX_SIZE,
  MIN_SIZE,
  nextId,
  positionOf,
  remove,
  snap,
  STEP,
  summarize,
  type GridItem,
  type GridKind,
} from "./model";

const ITEMS_KEY = "atelier-fractions";
const ZOOM_KEY = "atelier-zoom";
const clampZoom = (z: number) => Math.min(3, Math.max(0.4, Math.round(z * 100) / 100));
const ANIMATION_MS = 320;

export function Atelier() {
  const [items, setItems] = useLocalStorage<GridItem[]>(ITEMS_KEY, example);
  const [zoom, setZoom] = useLocalStorage(ZOOM_KEY, () => 1);
  const [newSize, setNewSize] = useState({ cols: 10, rows: 1 });
  const [color, setColor] = useState(PALETTE[0]);
  const [showCalc, setShowCalc] = useState(false);
  const [menu, setMenu] = useState<{ id: number; anchor: HTMLElement } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [animating, animate] = useTransientSet<number>(ANIMATION_MS);
  const { raise, raisedZ } = useRaise<number>();

  const stageRef = useRef<HTMLElement>(null);
  const { width, height } = useElementSize(stageRef);
  const unit = zoom * Math.min(width / 4.4, height / 3.35);

  // Trackpad pinch arrives as ctrl+wheel; React's wheel listener is passive, so it can't cancel it.
  useEffect(() => {
    const stage = stageRef.current!;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(z * Math.exp(-e.deltaY * 0.01)));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  const update = (id: number, change: (it: GridItem) => GridItem) =>
    setItems((all) => all.map((it) => (it.id === id ? change(it) : it)));

  const add = (kind: GridKind) =>
    setItems((all) => [
      ...all,
      {
        id: nextId(all),
        kind,
        ...newSize,
        filled: [],
        color: kind === "fill" ? color : undefined,
        at: freeSpot(all, kind, width / unit - 1.1),
      },
    ]);

  const onDragStart = (it: GridItem) => (e: PointerEvent) => {
    if (it.kind === "fill") raise(it.id);
    const from = positionOf(items, it);
    const riders = items.filter((o) => o.at === it.id).map((o) => o.id);
    setDragging(it.id);
    startDrag(e, {
      onMove: (d) =>
        update(it.id, (o) => ({ ...o, at: { x: from.x + d.x / unit, y: from.y + d.y / unit } })),
      onEnd: () => {
        setDragging(null);
        animate([it.id, ...riders]);
        setItems((all) => all.map((o) => (o.id === it.id ? { ...o, at: snap(all, o) } : o)));
      },
    });
  };

  const onPaintStart = (it: GridItem) => (e: PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const first = (e.target as Element).closest<SVGElement>("[data-cell]");
    if (!first) return;
    raise(it.id);
    const fill = !it.filled.includes(Number(first.dataset.cell));
    const apply = (target: Element | null) => {
      const cell = target?.closest<SVGElement>("[data-cell]");
      if (!cell || !container.contains(cell)) return;
      const i = Number(cell.dataset.cell);
      update(it.id, (o) => {
        if (fill === o.filled.includes(i)) return o;
        const filled = fill
          ? [...o.filled, i].sort((a, b) => a - b)
          : o.filled.filter((x) => x !== i);
        return { ...o, filled };
      });
    };
    apply(first);
    startDrag(e, { onMove: (_, ev) => apply(document.elementFromPoint(ev.clientX, ev.clientY)) });
  };

  const closeMenu = useCallback(() => setMenu(null), []);
  const menuItem = menu && items.find((it) => it.id === menu.id);

  const clear = () => {
    if (confirm("Effacer toutes les grilles ?")) setItems([]);
  };

  const offsets = barOffsets(items);
  const summaries = groups(items).map((group) => ({ group, ...summarize(items, group) }));
  const filledBases = new Set(
    summaries.flatMap((s) => (s.total[0] ? s.group.map((b) => b.id) : [])),
  );
  const size = extent(items);

  return (
    <ActivityLayout
      toolbar={
        <Toolbar>
          <NumberField
            label="Colonnes"
            value={newSize.cols}
            onChange={(cols) => setNewSize((s) => ({ ...s, cols }))}
            min={MIN_SIZE}
            max={MAX_SIZE}
          />
          <NumberField
            label="Lignes"
            value={newSize.rows}
            onChange={(rows) => setNewSize((s) => ({ ...s, rows }))}
            min={MIN_SIZE}
            max={MAX_SIZE}
          />
          <Button onClick={() => add("base")}>+ Grille vide</Button>
          <ToolbarSeparator />
          <Swatches colors={PALETTE} value={color} onChange={setColor} />
          <Button onClick={() => add("fill")}>+ Grille à remplir</Button>
          <ToolbarSeparator />
          <div className="flex items-center gap-1" role="group" aria-label="Zoom">
            <Button
              size="icon"
              aria-label="Dézoomer"
              onClick={() => setZoom((z) => clampZoom(z / 1.2))}
            >
              −
            </Button>
            <Button
              className="min-w-[4.2rem] px-1.5"
              title="Taille normale"
              onClick={() => setZoom(1)}
            >
              {Math.round(zoom * 100)} %
            </Button>
            <Button
              size="icon"
              aria-label="Zoomer"
              onClick={() => setZoom((z) => clampZoom(z * 1.2))}
            >
              +
            </Button>
          </div>
          <ToolbarSeparator />
          <Button aria-pressed={showCalc} onClick={() => setShowCalc((s) => !s)}>
            {showCalc ? "Cacher le calcul" : "Montrer le calcul"}
          </Button>
          <Button onClick={() => setItems(example())}>Exemple</Button>
          <Button onClick={clear}>Tout effacer</Button>
        </Toolbar>
      }
    >
      <main ref={stageRef} className="relative min-h-0 flex-1 touch-none overflow-auto">
        {items.length === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-xl text-muted">
            Choisis colonnes × lignes, puis ajoute une grille.
          </div>
        )}
        {unit > 0 && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute size-px"
              style={{ left: size.x * unit, top: size.y * unit }}
            />
            {items.map((it, index) => (
              <GridView
                key={it.id}
                item={it}
                position={positionOf(items, it)}
                unit={unit}
                zIndex={it.kind === "base" ? 1 : (raisedZ(it.id) ?? 10 + index)}
                barOffset={offsets.get(it.id) ?? 0}
                barText={
                  it.kind === "fill" ? (
                    <Fraction
                      numerator={it.filled.length}
                      denominator={cellCount(it)}
                      color={it.color}
                    />
                  ) : (
                    !filledBases.has(it.id) && (
                      <>
                        1 unité = <Fraction numerator={cellCount(it)} denominator={cellCount(it)} />
                      </>
                    )
                  )
                }
                dragging={dragging === it.id}
                animating={animating.has(it.id)}
                onDragStart={onDragStart(it)}
                onPaintStart={onPaintStart(it)}
                onMore={(anchor) => setMenu({ id: it.id, anchor })}
              />
            ))}
            {summaries.map(
              ({ group, total, whole, parts }) =>
                total[0] > 0 && (
                  <GroupLabel
                    key={group[0].id}
                    left={positionOf(items, group[0]).x * unit}
                    top={(positionOf(items, group[0]).y + 1 + BAR) * unit}
                    width={(1 + (group.length - 1) * STEP) * unit}
                    unit={unit}
                    total={total}
                    whole={whole}
                    parts={showCalc ? parts : null}
                  />
                ),
            )}
          </>
        )}
      </main>
      {menu && menuItem && (
        <GridMenu
          item={menuItem}
          anchor={menu.anchor}
          onChange={(next) => update(next.id, () => next)}
          onGlueRight={() => {
            setItems((all) => glueRight(all, menuItem));
            closeMenu();
          }}
          onDelete={() => {
            setItems((all) => remove(all, menuItem.id));
            closeMenu();
          }}
          onClose={closeMenu}
        />
      )}
    </ActivityLayout>
  );
}

type GroupLabelProps = {
  left: number;
  top: number;
  width: number;
  unit: number;
  total: readonly [number, number];
  whole: GridItem[];
  // Null hides the calculation.
  parts: GridItem[] | null;
};

function GroupLabel({ left, top, width, unit, total, whole, parts }: GroupLabelProps) {
  const unitColor = new Set(whole.map((it) => it.color)).size === 1 ? whole[0].color : undefined;
  const terms = parts && [
    ...(whole.length
      ? [{ key: "units", node: <span style={{ color: unitColor }}>{whole.length}</span> }]
      : []),
    ...parts.map((it) => ({
      key: it.id,
      node: <Fraction numerator={it.filled.length} denominator={cellCount(it)} color={it.color} />,
    })),
  ];

  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center gap-[0.4em] font-bold whitespace-nowrap"
      style={{ left, top, width, fontSize: unit * 0.075 }}
    >
      <Fraction numerator={total[0]} denominator={total[1]} color={COLORS.total} />
      {terms?.length ? (
        <>
          =
          {terms.map(({ key, node }, i) => (
            <span key={key} className="contents">
              {i > 0 && "+ "}
              {node}
            </span>
          ))}
        </>
      ) : null}
    </div>
  );
}
