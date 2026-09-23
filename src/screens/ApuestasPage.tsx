import { useEffect } from "react";
import { BarraNavegacion } from "@/components/BarraNavegacion";
import { LoaderApp } from "@/components/LoaderApp";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { useHaptic } from "@/hooks/useHaptic";
import { useMercado, type Lado } from "@/hooks/useMercado";
import { useSesion } from "@/hooks/useSesion";
import { FilaPregunta } from "@/screens/MarketPage";

const fuenteApple = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

export function ApuestasPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();

  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX ?? 0;
      if (x < 25) e.preventDefault();
    };
    document.addEventListener("touchstart", bloquearSwipeIOS, {
      passive: false,
    });
    return () => document.removeEventListener("touchstart", bloquearSwipeIOS);
  }, []);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lienzo">
        <LoaderApp />
      </div>
    );
  }

  if (!usuario) return <PantallaLogin entrarConGoogle={entrarConGoogle} />;

  if (!mercado.perfilCargado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lienzo">
        <LoaderApp />
      </div>
    );
  }

  if (!mercado.perfil.claseId) {
    return (
      <PantallaSeleccionClase
        clases={mercado.leerClases()}
        onElegir={mercado.elegirClase}
      />
    );
  }

  const preguntas = mercado.leerPreguntas({ estado: "abiertas" }) || [];
  const asignaturas = [...(mercado.leerAsignaturas() || [])].sort((a, b) => {
    if (a.cerrada !== b.cerrada) return a.cerrada ? 1 : -1;
    if (a.fechaExamen == null && b.fechaExamen == null) return 0;
    if (a.fechaExamen == null) return 1;
    if (b.fechaExamen == null) return -1;
    return a.fechaExamen - b.fechaExamen;
  });

  const esModerador = !!mercado.perfil.mod || !!usuario.esAdmin;

  const apostar = (id: string, lado: Lado) => {
    haptic();
    if ((mercado.saldo || 0) < 1) return;
    mercado.apostar(id, lado);
  };

  return (
    <div className="min-h-screen bg-lienzo pb-16" style={fuenteApple}>
      <BarraNavegacion
        activa="apuestas"
        esAdmin={usuario.esAdmin}
        esModerador={esModerador}
      />
      <main className="mx-auto w-full max-w-[520px] px-5 pt-8">
        <h1 className="text-[28px] font-bold tracking-tight text-ink">
          Todas las apuestas
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-sutil">
          Las preguntas abiertas de tu clase, examen por examen.
        </p>

        {asignaturas.map((asig) => {
          const deEsta = preguntas.filter((p) => p.asignaturaId === asig.id);
          if (deEsta.length === 0) return null;
          return (
            <section key={asig.id} className="mt-10">
              <h2 className="text-[13px] font-semibold uppercase tracking-widest text-sutil">
                {asig.nombre}
              </h2>
              <div className="mt-2">
                {deEsta.map((p) => (
                  <FilaPregunta
                    key={p.id}
                    pregunta={p}
                    bloqueado={mercado.pausado || asig.cerrada}
                    sinTokens={(mercado.saldo || 0) < 1}
                    ocultarBorde={deEsta[deEsta.length - 1]?.id === p.id}
                    onApostar={(lado) => apostar(p.id, lado)}
                    onRetirar={() => {
                      haptic();
                      mercado.retirar(p.id);
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {preguntas.length === 0 && (
          <p className="mt-12 text-center text-[15px] text-sutil">
            No hay preguntas abiertas.
          </p>
        )}
      </main>
    </div>
  );
}
