import { useState } from "react";

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
};

export function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const n = Math.round(Number(draft));
    onChange(Math.max(min, Math.min(max, Number.isFinite(n) && draft !== "" ? n : min)));
    setDraft(null);
  };

  return (
    <label className="flex items-center gap-1.5 font-semibold">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-16 rounded-control border-2 border-ink bg-surface p-1 text-center text-lg font-bold"
      />
    </label>
  );
}
