import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCurrentActivity } from "./activity";

type ActivityLayoutProps = {
  toolbar?: ReactNode;
  children: ReactNode;
};

export function ActivityLayout({ toolbar, children }: ActivityLayoutProps) {
  const title = useCurrentActivity()?.title;
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex flex-wrap items-center gap-6 px-6 py-3">
        <Link to="/" aria-label="Retour aux activités" className="text-2xl">
          ←
        </Link>
        <h1 className="text-[clamp(1.3rem,2.5vw,2rem)] font-bold">{title}</h1>
        {toolbar}
      </header>
      {children}
    </div>
  );
}
