import { cn } from "./cn";

type FractionProps = {
  numerator: number;
  denominator: number;
  color?: string;
  className?: string;
};

export function Fraction({ numerator, denominator, color, className }: FractionProps) {
  return (
    <span
      className={cn("inline-flex flex-col items-center align-middle leading-[1.05]", className)}
      style={{ color }}
    >
      <span className="border-b-[0.08em] border-current px-[0.15em]">{numerator}</span>
      <span>{denominator}</span>
    </span>
  );
}
