import { Link } from "@tanstack/react-router";

type Destino =
  "inicio" | "apuestas" | "resueltas" | "perfil" | "admin" | "mod" | "ninguna";

const enlaces: {
  to: "/" | "/apuestas" | "/resueltas" | "/profile";
  id: Exclude<Destino, "admin" | "mod" | "ninguna">;
  label: string;
}[] = [
  { to: "/", id: "inicio", label: "Inicio" },
  { to: "/apuestas", id: "apuestas", label: "Apuestas" },
  { to: "/resueltas", id: "resueltas", label: "Resueltas" },
  { to: "/profile", id: "perfil", label: "Perfil" },
];

export function BarraNavegacion({
  activa,
  esAdmin,
  esModerador,
}: {
  activa: Destino;
  esAdmin?: boolean;
  esModerador?: boolean;
}) {
  const destinos: { to: string; id: Destino; label: string }[] = [...enlaces];
  if (esAdmin) destinos.push({ to: "/admin", id: "admin", label: "Admin" });
  if (esModerador) destinos.push({ to: "/mod", id: "mod", label: "Mod" });

  return (
    <nav
      aria-label="Secciones"
      className="w-full shrink-0 border-t border-linea bg-lienzo"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-[520px]">
        {destinos.map((enlace) => {
          const seleccionado = activa === enlace.id;
          return (
            <Link
              key={enlace.id}
              to={enlace.to as never}
              className={`relative flex min-w-0 flex-1 items-center justify-center whitespace-nowrap px-0.5 py-3 text-[11px] leading-none ${
                seleccionado ? "font-semibold text-ink" : "text-sutil"
              }`}
            >
              {seleccionado && (
                <span className="absolute inset-x-0 top-0 h-[2px] bg-ink" />
              )}
              {enlace.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
