import { createFileRoute } from "@tanstack/react-router";
import { AjustesPage } from "@/screens/AjustesPage";

export const Route = createFileRoute("/ajustes")({
  component: AjustesPage,
});
