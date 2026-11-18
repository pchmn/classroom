import type { ReactNode } from "react";

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex flex-wrap items-center gap-4">{children}</div>;
}

export function ToolbarSeparator() {
  return <span aria-hidden className="w-0.5 self-stretch bg-divider" />;
}
