import { createFileRoute } from "@tanstack/react-router";
import { Atelier } from "../../activities/fractions/atelier/atelier";

export const Route = createFileRoute("/fractions/atelier")({
  staticData: {
    activity: {
      theme: "fractions",
      title: "Atelier des fractions",
      description: "Crée tes propres grilles, colorie-les et superpose-les",
    },
  },
  component: Atelier,
});
