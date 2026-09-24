import { Link } from "@tanstack/react-router";
import { FotoPerfil } from "@/components/FotoPerfil";
import { useSesion } from "@/hooks/useSesion";

const fuenteApple = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

type Destino = "inicio" | "apuestas" | "resueltas" | "perfil" | "ajustes";

const enlaces: {
  to: "/" | "/apuestas" | "/resueltas";
  id: Destino;
  label: string;
}[] = [
  { to: "/apuestas", id: "apuestas", label: "Apuestas" },
  { to: "/resueltas", id: "resueltas", label: "Resueltas" },
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
  const { usuario } = useSesion();

  return (
    <header
      className="sticky top-0 z-30 border-b border-linea bg-lienzo/95 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-[520px] items-center gap-3 px-4">
        <Link
          to="/"
          style={fuenteApple}
          className={`shrink-0 text-[16px] tracking-tight ${
            activa === "inicio"
              ? "font-bold text-ink"
              : "font-semibold text-ink/70"
          }`}
        >
          Casandra
        </Link>
        <nav
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
          aria-label="Secciones"
        >
          {enlaces.map((enlace) => {
            const seleccionado = activa === enlace.id;
            return (
              <Link
                key={enlace.id}
                to={enlace.to}
                style={fuenteApple}
                className={`shrink-0 rounded-full px-2.5 py-1.5 text-[13px] transition-colors ${
                  seleccionado
                    ? "bg-ink font-semibold text-white"
                    : "font-medium text-sutil hover:text-ink"
                }`}
              >
                {enlace.label}
              </Link>
            );
          })}
          {esAdmin && (
            <Link
              to={"/admin" as never}
              className="shrink-0 px-2 font-mono text-[11px] font-medium uppercase tracking-widest text-sutil"
            >
              Admn
            </Link>
          )}
          {esModerador && (
            <Link
              to={"/mod" as never}
              className="shrink-0 px-2 font-mono text-[11px] font-medium uppercase tracking-widest text-sutil"
            >
              Mod
            </Link>
          )}
        </nav>
        {usuario && activa !== "perfil" && (
          <Link
            to="/profile"
            aria-label="Perfil"
            className="shrink-0 touch-manipulation active:opacity-70"
          >
            <FotoPerfil
              foto={usuario.foto}
              inicial={usuario.inicial}
              marcada={false}
            />
          </Link>
        )}
      </div>
    </header>
  );
}
