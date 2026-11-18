import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PopoverProps = {
  anchor: HTMLElement;
  onClose: () => void;
  children: ReactNode;
};

const MARGIN = 8;
const GAP = 6;

// Opens below the anchor, right-aligned, and flips above it when there is no room.
export function Popover({ anchor, onClose, children }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const a = anchor.getBoundingClientRect();
    const m = ref.current!.getBoundingClientRect();
    const below = a.bottom + GAP;
    const top = below + m.height <= innerHeight - MARGIN ? below : a.top - m.height - GAP;
    setPosition({
      left: Math.max(MARGIN, Math.min(a.right - m.width, innerWidth - m.width - MARGIN)),
      top: Math.max(MARGIN, Math.min(top, innerHeight - m.height - MARGIN)),
    });
  }, [anchor]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      className="fixed z-[100000] flex max-h-[calc(100dvh-16px)] flex-col gap-3 overflow-auto rounded-panel border-2 border-ink bg-surface px-4 py-3.5 font-semibold shadow-[0_10px_30px_rgb(0_0_0/0.15)]"
      style={position ?? { visibility: "hidden", left: 0, top: 0 }}
    >
      {children}
    </div>,
    document.body,
  );
}
