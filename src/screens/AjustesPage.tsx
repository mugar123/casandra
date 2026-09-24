import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useMercado } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { LoaderApp } from "@/components/LoaderApp";
import { BarraNavegacion } from "@/components/BarraNavegacion";

const fuenteApple = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

export function AjustesPage() {
  const { usuario, cargando, entrarConGoogle, salir } = useSesion();
  const mercado = useMercado(usuario);
  const [nombreLocal, setNombreLocal] = useState("");
  const [copiado, setCopiado] = useState(false);

  const compartirApp = async () => {
    const url =
      window.location.hostname === "localhost"
        ? "https://casndra.vercel.app"
        : window.location.origin;
    const datosCompartir = {
      title: "Casandra",
      text: "Prueba Casandra, apuesta tokens sobre qué va a caer en el examen.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(datosCompartir);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      // El usuario canceló el menú de compartir.
    }
  };

  useEffect(() => {
    if (mercado.perfil?.nombre) setNombreLocal(mercado.perfil.nombre);
  }, [mercado.perfil?.nombre]);

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

  const guardarSiCambio = () => {
    if (nombreLocal !== mercado.perfil.nombre) mercado.guardarNombre(nombreLocal);
  };

  const esModerador = !!mercado.perfil.mod || !!usuario.esAdmin;

  return (
    <div className="min-h-screen bg-lienzo pb-16" style={fuenteApple}>
      <BarraNavegacion
        activa="ajustes"
        esAdmin={usuario.esAdmin}
        esModerador={esModerador}
      />

      <main className="mx-auto max-w-[520px] px-5 pt-8">
        <Link
          to="/profile"
          className="text-[15px] font-medium tracking-tight text-ink active:opacity-40"
        >
          ← Perfil
        </Link>
        <h1 className="mb-6 mt-4 text-[28px] font-bold tracking-tight text-ink">
          Ajustes
        </h1>

        <section className="overflow-hidden rounded-xl border border-borde bg-white shadow-sm">
          <div className="flex flex-col border-b border-linea p-4">
            <label className="text-[14px] font-medium text-sutil">
              Nombre (recomendado)
            </label>
            <div className="relative mt-2">
              <input
                value={nombreLocal}
                onChange={(e) => setNombreLocal(e.target.value)}
                onBlur={guardarSiCambio}
                disabled={mercado.perfil.usaHash}
                placeholder={usuario.nombre}
                className="w-full rounded-lg border border-borde bg-black/5 px-3 py-2 pr-10 text-[22px] font-semibold text-ink outline-none transition-colors placeholder:text-sutil/40 focus:border-ink/30 focus:bg-white disabled:border-transparent disabled:bg-transparent disabled:opacity-40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-ink">
                Sin nombre de usuario
              </span>
              <span className="mt-0.5 text-[12px] text-sutil">
                Ocultar tu nombre a los demás
              </span>
            </div>
            <button
              onClick={() => mercado.usarHash(!mercado.perfil.usaHash)}
              className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                mercado.perfil.usaHash ? "bg-verde" : "bg-black/10"
              }`}
              role="switch"
              aria-checked={mercado.perfil.usaHash}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  mercado.perfil.usaHash ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col border-t border-linea p-4">
            <label className="text-[14px] font-medium text-sutil">
              Grado / Clase
            </label>
            <div className="relative mt-2">
              <select
                value={mercado.perfil.claseId || ""}
                onChange={(e) => mercado.elegirClase(e.target.value)}
                className="w-full appearance-none rounded-lg border border-borde bg-black/5 px-3 py-2.5 pr-10 text-[16px] font-medium text-ink outline-none transition-colors focus:border-ink/30 focus:bg-white"
              >
                <option value="" disabled>
                  Selecciona tu clase...
                </option>
                {mercado.leerClases().map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <p className="mt-4 px-2 text-[13px] text-sutil">
          En el ranking te ven como{" "}
          <span className="font-semibold text-ink">{mercado.miNombre}</span>.
        </p>

        <button
          onClick={() => compartirApp()}
          className="mt-8 flex w-full touch-manipulation items-center justify-center rounded-xl border border-borde bg-white px-4 py-3.5 text-[15px] font-medium text-ink active:bg-black/5"
        >
          {copiado ? "Enlace copiado" : "Compartir la app"}
        </button>

        <button
          onClick={() => salir()}
          className="mt-10 flex w-full touch-manipulation items-center justify-center rounded-xl bg-rojo/10 px-4 py-3.5 text-[15px] font-semibold text-rojo active:bg-rojo/20"
        >
          Cerrar sesión
        </button>
        <p className="mt-3 text-center text-[12px] text-sutil">
          Para eliminar tus datos, consúltame.
        </p>
      </main>
    </div>
  );
}
