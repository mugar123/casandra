import { useEffect, useState } from "react";
import { BarraNavegacion } from "@/components/BarraNavegacion";
import { LoaderApp } from "@/components/LoaderApp";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { useHaptic } from "@/hooks/useHaptic";
import { useMercado, type Lado } from "@/hooks/useMercado";
import { useSesion } from "@/hooks/useSesion";
import {
  Asignaturas,
  CountdownExamen,
  FilaPregunta,
} from "@/screens/MarketPage";

export function ApuestasPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();
  const [asigActiva, setAsigActiva] = useState("");

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
  const todas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = [...(mercado.leerAsignaturas() || [])].sort((a, b) => {
    if (a.cerrada !== b.cerrada) return a.cerrada ? 1 : -1;
    if (a.fechaExamen == null && b.fechaExamen == null) return 0;
    if (a.fechaExamen == null) return 1;
    if (b.fechaExamen == null) return -1;
    return a.fechaExamen - b.fechaExamen;
  });
  const asigId = asigActiva || asignaturas[0]?.id || "";
  const asig = asignaturas.find((a) => a.id === asigId);
  const deEsta = preguntas.filter((p) => p.asignaturaId === asigId);

  const esModerador = !!mercado.perfil.mod || !!usuario.esAdmin;

  const apostar = (id: string, lado: Lado) => {
    haptic();
    if ((mercado.saldo || 0) < 1) return;
    mercado.apostar(id, lado);
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-lienzo">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-none">
      <main
        className="mx-auto w-full max-w-[520px] pb-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
      >
        <Asignaturas
          asignaturas={asignaturas}
          asigId={asigId}
          setAsigActiva={(id) => {
            haptic();
            setAsigActiva(id);
          }}
          preguntas={todas}
          saldo={mercado.saldo || 0}
        />

        <div className="px-5">
          {asig?.fechaExamen ? (
            <CountdownExamen
              fechaExamen={asig.fechaExamen}
              asignaturaId={asig.id}
              onEditar={mercado.editarFechaExamenPublica}
            />
          ) : (
            <p className="py-2 text-center text-[13px] text-sutil">
              Sin fecha de examen.
            </p>
          )}

          {deEsta.length === 0 ? (
            <p className="mt-4 text-center text-[15px] text-sutil">
              No hay preguntas abiertas.
            </p>
          ) : (
            deEsta.map((p, index) => (
              <FilaPregunta
                key={p.id}
                pregunta={p}
                bloqueado={Boolean(mercado.pausado || asig?.cerrada)}
                sinTokens={(mercado.saldo || 0) < 1}
                ocultarBorde={index === deEsta.length - 1}
                onApostar={(lado) => apostar(p.id, lado)}
                onRetirar={() => {
                  haptic();
                  mercado.retirar(p.id);
                }}
              />
            ))
          )}
        </div>
      </main>
      </div>
      <BarraNavegacion
        activa="apuestas"
        esAdmin={!!usuario.esAdmin}
        esModerador={esModerador}
      />
    </div>
  );
}
