import type { PointerEvent as ReactPointerEvent } from "react";

type DragHandlers = {
  onMove: (delta: { x: number; y: number }, event: PointerEvent) => void;
  onEnd?: () => void;
};

// Tracks the pointer on window so the drag survives leaving the element.
export function startDrag(e: ReactPointerEvent, { onMove, onEnd }: DragHandlers) {
  e.preventDefault();
  const start = { x: e.clientX, y: e.clientY };
  const move = (ev: PointerEvent) =>
    onMove({ x: ev.clientX - start.x, y: ev.clientY - start.y }, ev);
  const end = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    onEnd?.();
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}
