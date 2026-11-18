import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "./cn";

type StepperProps = {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  decrementLabel: string;
  incrementLabel: string;
  swatch?: string;
  className?: string;
};

export function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  decrementLabel,
  incrementLabel,
  swatch,
  className,
}: StepperProps) {
  const step = (delta: number) => onChange(Math.max(min, Math.min(max, value + delta)));
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="flex items-center gap-1.5">
        {swatch && <span className="size-3.5 rounded-[3px]" style={{ background: swatch }} />}
        {label}
      </span>
      <span className="flex items-center gap-1.5">
        <Button size="icon" aria-label={decrementLabel} onClick={() => step(-1)}>
          −
        </Button>
        <output className="min-w-[1.6em] text-center text-xl">{value}</output>
        <Button size="icon" aria-label={incrementLabel} onClick={() => step(1)}>
          +
        </Button>
      </span>
    </div>
  );
}
