import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCurrentActivity } from "../activities/activity";

export const Route = createRootRoute({
  component: Root,
  notFoundComponent: NotFound,
});

function Root() {
  const title = useCurrentActivity()?.title;
  useEffect(() => {
    document.title = title ?? "Activités de classe";
  }, [title]);
  return <Outlet />;
}

function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Page introuvable</h1>
      <Link to="/" className="mt-4 inline-block underline">
        Retour aux activités
      </Link>
    </main>
  );
}
