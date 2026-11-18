import { useMemo, type PointerEvent, type ReactNode } from "react";
import { cn, SvgMarkup } from "../../../ui";
import { customGrid } from "../grids";
import { BAR, type GridItem, type Point } from "./model";

type GridViewProps = {
  item: GridItem;
  position: Point;
  unit: number;
  zIndex: number;
  barOffset: number;
  barText: ReactNode;
  dragging: boolean;
  animating: boolean;
  onDragStart: (e: PointerEvent) => void;
  onPaintStart: (e: PointerEvent<HTMLDivElement>) => void;
  onMore: (anchor: HTMLElement) => void;
};

export function GridView({
  item,
  position,
  unit,
  zIndex,
  barOffset,
  barText,
  dragging,
  animating,
  onDragStart,
  onPaintStart,
  onMore,
}: GridViewProps) {
  const isFill = item.kind === "fill";
  const { cols, rows, filled, color } = item;
  const markup = useMemo(
    () => customGrid({ cols, rows, filled, color, background: isFill ? "none" : "#fff" }),
    [cols, rows, filled, color, isFill],
  );

  return (
    <div
      className={cn(
        "absolute",
        dragging && "drop-shadow-[0_8px_16px_rgb(0_0_0/0.25)]",
        animating && "transition-[left,top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
      )}
      style={{
        left: position.x * unit,
        top: position.y * unit,
        width: unit,
        height: unit,
        zIndex,
      }}
    >
      <div
        className={cn("size-full", isFill && "cursor-crosshair")}
        onPointerDown={isFill ? onPaintStart : undefined}
      >
        <SvgMarkup markup={markup} />
      </div>
      <div
        className={cn(
          "absolute inset-x-0 flex items-center justify-between gap-1 font-bold whitespace-nowrap select-none touch-none",
          dragging ? "cursor-grabbing" : "cursor-grab",
          isFill ? "" : "top-full",
        )}
        style={{
          height: BAR * unit,
          fontSize: unit * 0.06,
          bottom: isFill ? `calc(100% + ${barOffset * BAR * unit}px)` : undefined,
        }}
        onPointerDown={onDragStart}
      >
        <span className="px-[0.2em] text-[1.2em] opacity-45">⠿</span>
        <span>{barText}</span>
        <button
          type="button"
          aria-label="Modifier la grille"
          className="px-[0.3em] text-[1.3em] leading-none opacity-50 hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onMore(e.currentTarget);
          }}
        >
          ⋯
        </button>
      </div>
    </div>
  );
}
