import { useMatches } from "@tanstack/react-router";

export const THEMES = {
  fractions: "Fractions",
} as const;

export type Activity = {
  theme: keyof typeof THEMES;
  title: string;
  description: string;
};

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    activity?: Activity;
  }
}

export function useCurrentActivity() {
  return useMatches({
    select: (matches) => matches.findLast((m) => m.staticData.activity)?.staticData.activity,
  });
}
