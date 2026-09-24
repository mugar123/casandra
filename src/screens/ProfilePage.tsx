import { useEffect, type ReactNode } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useMercado, type Pregunta } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { LoaderApp } from "@/components/LoaderApp";
import { BarraNavegacion } from "@/components/BarraNavegacion";
import { TextoLatex } from "@/components/TextoLatex";

const fuenteApple = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

function haGanado(p: Pregunta): boolean {
  const misSi = p.misSi || 0;
  const misNo = p.misNo || 0;
  return (p.resultado === true && misSi > 0) || (p.resultado === false && misNo > 0);
}

function beneficio(p: Pregunta): number {
  const misSi = p.misSi || 0;
  const misNo = p.misNo || 0;
  const apuesta = misSi > 0 ? misSi : misNo;
  const poolSi = p.poolSi || 0;
  const poolNo = p.poolNo || 0;
  const poolGanador = p.resultado ? poolSi : poolNo;
  const poolPerdedor = p.resultado ? poolNo : poolSi;
  if (!haGanado(p) || poolGanador <= 0) return 0;
  const proporcion = apuesta / poolGanador;
  return Math.round(apuesta + proporcion * poolPerdedor) - apuesta;
}

export function ProfilePage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);

  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      if ((e.touches[0]?.clientX ?? 0) < 25) e.preventDefault();
    };
    document.addEventListener("touchstart", bloquearSwipeIOS, { passive: false });
    return () => document.removeEventListener("touchstart", bloquearSwipeIOS);
  }, []);

  if (cargando || (usuario && !mercado.perfilCargado)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lienzo">
        <LoaderApp />
      </div>
    );
  }

  if (!usuario) return <PantallaLogin entrarConGoogle={entrarConGoogle} />;

  const esModerador = !!mercado.perfil.mod || !!usuario.esAdmin;
  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];
  const nombreAsig = (id: string) =>
    asignaturas.find((a) => a.id === id)?.nombre ?? "";

  const enJuego = preguntas.filter(
    (p) => p.resultado === null && ((p.misSi || 0) > 0 || (p.misNo || 0) > 0),
  );
  const ganadas = preguntas
    .filter((p) => p.resultado !== null && haGanado(p))
    .sort((a, b) => (b.creadaEn || 0) - (a.creadaEn || 0));

  const clase = mercado
    .leerClases()
    .find((c) => c.id === mercado.perfil.claseId)?.nombre;

  return (
    <div className="min-h-screen bg-lienzo pb-16" style={fuenteApple}>
      <BarraNavegacion
        activa="perfil"
        esAdmin={usuario.esAdmin}
        esModerador={esModerador}
      />

      <main className="mx-auto max-w-[520px] px-5 pt-10">
        <div className="min-w-0 pr-10">
          <h1 className="truncate text-[28px] font-bold leading-none tracking-tight text-ink">
            {mercado.miNombre}
          </h1>
          {clase && <p className="mt-1.5 text-[15px] text-sutil">{clase}</p>}
        </div>

        <div className="mt-10">
          <p className="flex items-center justify-center gap-4 font-mono text-[64px] leading-none tabular-nums text-ink">
            {mercado.saldo || 0}
            <span aria-hidden className="h-14 w-14 rounded-full bg-moneda" />
          </p>
          <p className="mt-4 text-center font-mono text-[15px] tabular-nums text-sutil">
            {enJuego.reduce((suma, p) => suma + (p.misSi || 0) + (p.misNo || 0), 0)}{" "}
            en juego
          </p>
        </div>

        <Seccion titulo="En juego">
          {enJuego.length === 0 ? (
            <p className="px-4 py-5 text-[15px] text-sutil">No tienes apuestas abiertas.</p>
          ) : (
            enJuego.map((p) => (
              <Fila
                key={p.id}
                asignatura={nombreAsig(p.asignaturaId)}
                titulo={p.titulo}
                detalle={detalleEnJuego(p)}
                tono={(p.misSi || 0) > 0 ? "si" : "no"}
              />
            ))
          )}
        </Seccion>

        <Seccion titulo="Ganadas">
          {ganadas.length === 0 ? (
            <p className="px-4 py-5 text-[15px] text-sutil">
              Cuando aciertes, aparecerán aquí.
            </p>
          ) : (
            ganadas.map((p) => (
              <Fila
                key={p.id}
                asignatura={nombreAsig(p.asignaturaId)}
                titulo={p.titulo}
                detalle={`+${beneficio(p)}`}
                tono="si"
              />
            ))
          )}
        </Seccion>

      </main>
    </div>
  );
}

const mono = "font-mono text-[11px] uppercase tracking-widest";

function detalleEnJuego(p: Pregunta): string {
  const si = (p.misSi || 0) > 0;
  const tokens = si ? p.misSi : p.misNo;
  return `${tokens} · ${si ? "SÍ" : "NO"}`;
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className={`mb-2 px-1 text-sutil ${mono}`}>{titulo}</h2>
      <div className="overflow-hidden rounded-xl border border-borde bg-white">
        {children}
      </div>
    </section>
  );
}

function Fila({
  asignatura,
  titulo,
  detalle,
  tono,
}: {
  asignatura: string;
  titulo: string;
  detalle: string;
  tono: "si" | "no";
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-linea px-4 py-4 last:border-0">
      <div className="min-w-0">
        {asignatura && (
          <p className="text-[13px] text-sutil">{asignatura}</p>
        )}
        <p className="mt-0.5 text-[17px] leading-snug text-ink">
          <TextoLatex texto={titulo} />
        </p>
      </div>
      <span
        className={`shrink-0 font-mono text-[15px] tabular-nums ${
          tono === "si" ? "text-verde" : "text-rojo"
        }`}
      >
        {detalle}
      </span>
    </div>
  );
}
