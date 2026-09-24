import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useMercado, type Pregunta } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { LoaderApp } from "@/components/LoaderApp";
import { BarraNavegacion } from "@/components/BarraNavegacion";
import { FotoPerfil } from "@/components/FotoPerfil";
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

      <main className="mx-auto max-w-[520px] px-5 pt-8">
        <div className="flex items-center gap-4">
          <FotoPerfil
            foto={usuario.foto}
            inicial={usuario.inicial}
            className="h-[72px] w-[72px] text-[28px]"
          />
          <div className="min-w-0">
            <h1 className="truncate text-[28px] font-bold tracking-tight text-ink">
              {mercado.miNombre}
            </h1>
            {clase && <p className="mt-0.5 text-[15px] text-sutil">{clase}</p>}
          </div>
        </div>

        <div className="mb-4 mt-12 flex items-center justify-center gap-3">
          <span className="font-mono text-[64px] leading-none tabular-nums text-ink">
            {mercado.saldo || 0}
          </span>
          <span aria-hidden className="h-12 w-12 rounded-full bg-moneda" />
        </div>
        <p className="mb-12 text-center text-[13px] text-sutil">Tu saldo</p>

        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-widest text-sutil">
            En juego
          </h2>
          {enJuego.length === 0 ? (
            <p className="mt-3 text-[15px] text-sutil">No tienes apuestas abiertas.</p>
          ) : (
            <ul className="mt-2">
              {enJuego.map((p) => {
                const lado = (p.misSi || 0) > 0 ? "SÍ" : "NO";
                const tokens = (p.misSi || 0) > 0 ? p.misSi : p.misNo;
                return (
                  <li key={p.id} className="border-b border-linea py-4 last:border-0">
                    <p className="text-[12px] text-sutil">{nombreAsig(p.asignaturaId)}</p>
                    <p className="mt-1 text-[17px] font-medium leading-snug text-ink">
                      <TextoLatex texto={p.titulo} />
                    </p>
                    <p className="mt-1 font-mono text-[13px] tabular-nums text-ink">
                      {tokens} a {lado}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-[13px] font-medium uppercase tracking-widest text-sutil">
            Ganadas
          </h2>
          {ganadas.length === 0 ? (
            <p className="mt-3 text-[15px] text-sutil">
              Cuando aciertes, el historial aparecerá aquí.
            </p>
          ) : (
            <ul className="mt-2">
              {ganadas.map((p) => (
                <li key={p.id} className="border-b border-linea py-4 last:border-0">
                  <p className="text-[12px] text-sutil">{nombreAsig(p.asignaturaId)}</p>
                  <p className="mt-1 text-[17px] font-medium leading-snug text-ink">
                    <TextoLatex texto={p.titulo} />
                  </p>
                  <p className="mt-1 font-mono text-[13px] tabular-nums text-verde">
                    +{beneficio(p)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          to="/ajustes"
          className="mt-12 flex w-full items-center justify-between rounded-xl border border-borde bg-white px-4 py-3.5 text-[15px] font-medium text-ink active:bg-black/5"
        >
          Ajustes
          <span aria-hidden className="text-sutil">
            →
          </span>
        </Link>
      </main>
    </div>
  );
}
