import { createFileRoute } from "@tanstack/react-router";
import { ApuestasPage } from "@/screens/ApuestasPage";

export const Route = createFileRoute("/apuestas")({
  component: ApuestasPage,
});
