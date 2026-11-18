import type { ComponentProps } from "react";
import { cn } from "./cn";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "default" | "danger";
  size?: "md" | "icon";
};

export function Button({ variant = "default", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-control border-2 bg-surface font-semibold transition-colors hover:bg-highlight active:scale-[0.97]",
        variant === "danger" ? "border-danger text-danger" : "border-ink text-ink",
        size === "icon" ? "size-9 shrink-0 text-lg leading-none" : "px-3.5 py-1.5",
        className,
      )}
      {...props}
    />
  );
}
