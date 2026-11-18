import { createFileRoute } from "@tanstack/react-router";
import { DixiemesCentiemes } from "../../activities/fractions/dixiemes-centiemes/dixiemes-centiemes";
import { MAX } from "../../activities/fractions/dixiemes-centiemes/model";

const count = (value: unknown, max: number, fallback: number) =>
  value === undefined ? fallback : Math.max(0, Math.min(max, Math.trunc(Number(value)) || 0));

export const Route = createFileRoute("/fractions/dixiemes-centiemes")({
  staticData: {
    activity: {
      theme: "fractions",
      title: "Dixièmes et centièmes",
      description: "75/100 = 7/10 + 5/100 avec des grilles à superposer",
    },
  },
  validateSearch: (search: Record<string, unknown>) => ({
    u: count(search.u, MAX.units, 0),
    d: count(search.d, MAX.tenths, 7),
    c: count(search.c, MAX.hundredths, 5),
  }),
  component: Page,
});

function Page() {
  const { u, d, c } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <DixiemesCentiemes
      counts={{ units: u, tenths: d, hundredths: c }}
      onCountsChange={(next) =>
        navigate({ search: { u: next.units, d: next.tenths, c: next.hundredths }, replace: true })
      }
    />
  );
}
