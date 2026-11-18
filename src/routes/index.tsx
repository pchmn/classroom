import { createFileRoute, useRouter } from "@tanstack/react-router";
import { THEMES, type Activity } from "../activities/activity";
import { LinkCard } from "../ui";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { routesById } = useRouter();
  const activities = Object.values(routesById).flatMap((route) => {
    const activity: Activity | undefined = route.options.staticData?.activity;
    return activity ? [{ ...activity, to: route.fullPath as string }] : [];
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-[clamp(1.3rem,2.5vw,2rem)] font-bold">Activités de classe</h1>
      {Object.entries(THEMES).map(([theme, name]) => {
        const inTheme = activities.filter((a) => a.theme === theme);
        if (!inTheme.length) return null;
        return (
          <section key={theme} className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-muted">{name}</h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
              {inTheme.map((a) => (
                <li key={a.to}>
                  <LinkCard to={a.to} title={a.title} description={a.description} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
