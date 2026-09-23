import { useEffect, useState } from "react";

const CLAVE = "casandra-como-funciona-home";

const fuenteApple = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const parrafos = [
  "Imagina que Fulanito cree que va a caer el ciclo del agua en el examen, porque hace mucho que no cae. Él está muy seguro porque estuvo atento en clase. Apuesta 1 token al SÍ. Sus compañeros Menganito y Zitanito creen que no va a entar, entonces apuestan 1 token cada uno al NO.",
  "La probabilidad de que caiga es del 33% porque esa es la fracción de los participantes creen que va a entrar (1/3). La opinión del grupo queda guardada en ese número.",
  "Cuando llega el día del examen, Fulanito tiene razón. Como Fulanito acertó, se lleva los 2 tokens de sus amigos. Fulanito tiene ahora 3 tokens. ¡Es rico!",
  "El mercado recompensa al que aporta información verdadera. Casandra es simplemente una máquina que agrega conocimiento colectivo y produce un porcentaje fiable %.",
  "Úsalo para consultar la opinión de tu clase.",
];

export function VentanaComoFunciona() {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CLAVE)) setAbierta(true);
    } catch {
      setAbierta(true);
    }
  }, []);

  useEffect(() => {
    if (!abierta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [abierta]);

  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {
      // Si el navegador bloquea el almacenamiento, la ventana se cierra igual.
    }
    setAbierta(false);
  };

  if (!abierta) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={cerrar}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="como-funciona-titulo"
        style={{
          ...fuenteApple,
          maxHeight: "min(720px, calc(100dvh - 2.5rem))",
        }}
        className="relative flex w-full max-w-[460px] flex-col overflow-hidden rounded-[28px] border border-borde bg-lienzo shadow-[0_24px_80px_rgba(20,16,12,0.28)]"
      >
        <div className="overflow-y-auto px-7 pb-2 pt-8 sm:px-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-3.5 w-3.5 rounded-full bg-moneda shadow-sm" />
            <span className="h-3.5 w-3.5 rounded-full bg-verde" />
            <span className="h-3.5 w-3.5 rounded-full bg-rojo" />
          </div>
          <h2
            id="como-funciona-titulo"
            className="text-[28px] font-bold leading-[1.15] tracking-tight text-ink"
          >
            ¿No entiendes cómo funciona? Lee esto.
          </h2>
          <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-ink/85">
            {parrafos.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}
          </div>
        </div>
        <div className="shrink-0 border-t border-linea bg-lienzo px-7 py-5 sm:px-8">
          <button
            type="button"
            onClick={cerrar}
            autoFocus
            className="w-full touch-manipulation rounded-2xl bg-ink py-3.5 text-[16px] font-medium text-white transition-transform active:scale-[0.98]"
          >
            Entendido
          </button>
        </div>
      </section>
    </div>
  );
}
