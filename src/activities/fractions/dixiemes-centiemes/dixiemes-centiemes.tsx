import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { startDrag } from "../../../lib/drag";
import { useElementSize } from "../../../lib/use-element-size";
import { useRaise } from "../../../lib/use-raise";
import { useTransientSet } from "../../../lib/use-transient-set";
import { Button, cn, Fraction, Stepper, SvgMarkup, Toolbar } from "../../../ui";
import { ActivityLayout } from "../../activity-layout";
import { baseGrid, COLORS, hundredthsGrid, tenthsGrid, unitGrid } from "../grids";
import {
  baseIds,
  computeLayout,
  coveredHundredths,
  isBase,
  MAX,
  nearestBase,
  overlayIds,
  resolve,
  stackTargets,
  type Counts,
  type OverlayId,
  type Placement,
} from "./model";

const ANIMATION_MS = 450;
const STACK_STAGGER_MS = 350;

type Props = {
  counts: Counts;
  onCountsChange: (counts: Counts) => void;
};

export function DixiemesCentiemes({ counts, onCountsChange }: Props) {
  const [showEquation, setShowEquation] = useState(false);
  const [placements, setPlacements] = usePlacements(overlayIds(counts).join());
  const [animating, animate] = useTransientSet<OverlayId>(ANIMATION_MS);
  const { raise, raisedZ } = useRaise<OverlayId>();
  const stackTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => stackTimers.current.forEach(clearTimeout), []);

  const moveTo = (id: OverlayId, target: Placement) => {
    animate([id]);
    setPlacements((p) => ({ ...p, [id]: target }));
  };

  const stack = () => {
    stackTargets(counts).forEach(([id, base], i) => {
      const timer = setTimeout(() => {
        raise(id);
        moveTo(id, base);
      }, i * STACK_STAGGER_MS);
      stackTimers.current.push(timer);
    });
  };

  const separate = () => {
    for (const id of overlayIds(counts)) moveTo(id, "home");
  };

  const setCount = (key: keyof Counts) => (value: number) =>
    onCountsChange({ ...counts, [key]: value });

  return (
    <ActivityLayout
      toolbar={
        <Toolbar>
          <Stepper
            label="Unités"
            swatch={COLORS.unit}
            value={counts.units}
            onChange={setCount("units")}
            min={0}
            max={MAX.units}
            decrementLabel="Moins d'unités"
            incrementLabel="Plus d'unités"
          />
          <Stepper
            label="Dixièmes"
            swatch={COLORS.tenths}
            value={counts.tenths}
            onChange={setCount("tenths")}
            min={0}
            max={MAX.tenths}
            decrementLabel="Moins de dixièmes"
            incrementLabel="Plus de dixièmes"
          />
          <Stepper
            label="Centièmes"
            swatch={COLORS.hundredths}
            value={counts.hundredths}
            onChange={setCount("hundredths")}
            min={0}
            max={MAX.hundredths}
            decrementLabel="Moins de centièmes"
            incrementLabel="Plus de centièmes"
          />
          <Button onClick={stack}>Superposer</Button>
          <Button onClick={separate}>Séparer</Button>
          <Button onClick={() => setShowEquation((s) => !s)}>
            {showEquation ? "Cacher le calcul" : "Montrer le calcul"}
          </Button>
        </Toolbar>
      }
    >
      <Board
        counts={counts}
        placements={placements}
        onPlace={(id, p) => setPlacements((all) => ({ ...all, [id]: p }))}
        onDrop={moveTo}
        animating={animating}
        raise={raise}
        raisedZ={raisedZ}
      />
      {showEquation && <Equation counts={counts} />}
    </ActivityLayout>
  );
}

type Placements = Partial<Record<OverlayId, Placement>>;

// Adding or removing a grid rebuilds the board, so every overlay goes back home.
function usePlacements(board: string) {
  const [state, setState] = useState<{ board: string; at: Placements }>({ board, at: {} });
  const at = state.board === board ? state.at : {};
  const setAt = (update: (at: Placements) => Placements) =>
    setState((s) => ({ board, at: update(s.board === board ? s.at : {}) }));
  return [at, setAt] as const;
}

type BoardProps = {
  counts: Counts;
  placements: Placements;
  onPlace: (id: OverlayId, placement: Placement) => void;
  onDrop: (id: OverlayId, placement: Placement) => void;
  animating: ReadonlySet<OverlayId>;
  raise: (id: OverlayId) => void;
  raisedZ: (id: OverlayId) => number | undefined;
};

function Board({ counts, placements, onPlace, onDrop, animating, raise, raisedZ }: BoardProps) {
  const stageRef = useRef<HTMLElement>(null);
  const { width, height } = useElementSize(stageRef);
  const [dragging, setDragging] = useState<OverlayId | null>(null);

  const bases = baseIds(counts.units);
  const overlays = overlayIds(counts);
  const { size, home } = computeLayout(width, height, bases, overlays);
  const covered = coveredHundredths(placements, counts);
  const ready = size > 0;

  const onPointerDown = (id: OverlayId) => (e: PointerEvent) => {
    const from = resolve(placements[id], id, home);
    let last = from;
    raise(id);
    setDragging(id);
    startDrag(e, {
      onMove: (d) => {
        last = { x: from.x + d.x / size, y: from.y + d.y / size };
        onPlace(id, last);
      },
      onEnd: () => {
        setDragging(null);
        const base = nearestBase(last, bases, home);
        if (base) onDrop(id, base);
      },
    });
  };

  const labelStyle: CSSProperties = { fontSize: size * 0.075 };
  const unitLabel = (color?: string) => (
    <>
      1 unité = <Fraction numerator={100} denominator={100} color={color} />
    </>
  );

  return (
    <main ref={stageRef} className="relative flex-1 touch-none">
      {ready && (
        <>
          <div
            className="absolute mt-2 text-center font-bold whitespace-nowrap"
            style={{
              ...labelStyle,
              left: home[bases[0]].x * size,
              top: (home[bases[0]].y + 1) * size,
              width: bases.length * size,
            }}
          >
            {covered > 0 && <Fraction numerator={covered} denominator={100} color={COLORS.total} />}
          </div>
          {bases.map((id) => (
            <GridTile
              key={id}
              point={home[id]}
              size={size}
              markup={baseGrid()}
              labelStyle={labelStyle}
            >
              {covered === 0 && unitLabel()}
            </GridTile>
          ))}
          {overlays.map((id) => (
            <GridTile
              key={id}
              point={resolve(placements[id], id, home)}
              size={size}
              markup={overlayMarkup(id, counts)}
              labelStyle={labelStyle}
              hideLabel={isBase(placements[id])}
              className={cn(
                dragging === id
                  ? "cursor-grabbing drop-shadow-[0_8px_16px_rgb(0_0_0/0.25)]"
                  : "cursor-grab",
                animating.has(id) &&
                  "transition-[left,top] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
              style={{ zIndex: raisedZ(id) }}
              onPointerDown={onPointerDown(id)}
            >
              {overlayLabel(id, counts, unitLabel)}
            </GridTile>
          ))}
        </>
      )}
    </main>
  );
}

function overlayMarkup(id: OverlayId, { tenths, hundredths }: Counts) {
  if (id === "tenths") return tenthsGrid(tenths);
  if (id === "hundredths") return hundredthsGrid(hundredths, tenths);
  return unitGrid();
}

function overlayLabel(id: OverlayId, counts: Counts, unitLabel: (color: string) => ReactNode) {
  if (id === "tenths")
    return <Fraction numerator={counts.tenths} denominator={10} color={COLORS.tenths} />;
  if (id === "hundredths")
    return <Fraction numerator={counts.hundredths} denominator={100} color={COLORS.hundredths} />;
  return unitLabel(COLORS.unit);
}

type GridTileProps = {
  point: { x: number; y: number };
  size: number;
  markup: string;
  labelStyle: CSSProperties;
  hideLabel?: boolean;
  className?: string;
  style?: CSSProperties;
  onPointerDown?: (e: PointerEvent) => void;
  children: ReactNode;
};

function GridTile({
  point,
  size,
  markup,
  labelStyle,
  hideLabel,
  className,
  style,
  onPointerDown,
  children,
}: GridTileProps) {
  return (
    <div
      className={cn("absolute touch-none select-none", className)}
      style={{ ...style, left: point.x * size, top: point.y * size, width: size, height: size }}
      onPointerDown={onPointerDown}
    >
      <SvgMarkup markup={markup} />
      <div
        className={cn(
          "absolute inset-x-0 top-full mt-2 text-center font-bold whitespace-nowrap transition-opacity duration-150",
          hideLabel && "opacity-0",
        )}
        style={labelStyle}
      >
        {children}
      </div>
    </div>
  );
}

function Equation({ counts: { units, tenths, hundredths } }: { counts: Counts }) {
  const total = units * 100 + tenths * 10 + hundredths;
  const terms = [
    units > 0 && (
      <span key="units" style={{ color: COLORS.unit }}>
        {units}
      </span>
    ),
    tenths > 0 && (
      <Fraction key="tenths" numerator={tenths} denominator={10} color={COLORS.tenths} />
    ),
    hundredths > 0 && (
      <Fraction
        key="hundredths"
        numerator={hundredths}
        denominator={100}
        color={COLORS.hundredths}
      />
    ),
  ].filter(Boolean);
  return (
    <div className="flex items-center justify-center gap-[0.6em] pt-1.5 pb-5 text-[clamp(1.6rem,4vw,3rem)] font-bold">
      <Fraction numerator={total} denominator={100} color={COLORS.total} /> =
      {terms.length === 0 ? <span>0</span> : terms.flatMap((t, i) => (i === 0 ? [t] : [" + ", t]))}
    </div>
  );
}
