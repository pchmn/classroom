import { cn } from "./cn";

type SwatchesProps = {
  colors: readonly string[];
  value: string | undefined;
  onChange: (color: string) => void;
  label?: string;
};

export function Swatches({ colors, value, onChange, label = "Couleur" }: SwatchesProps) {
  return (
    <div className="flex gap-1.5" role="group" aria-label={label}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={color}
          aria-pressed={color === value}
          className={cn(
            "size-8 rounded-full border-[3px] border-transparent transition-transform active:scale-90",
            "aria-pressed:border-ink",
          )}
          style={{ background: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
